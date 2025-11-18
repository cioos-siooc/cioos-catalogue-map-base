const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const fetch = require("node-fetch"); // v2
const { createHash } = require("crypto");

// Load config
const config = yaml.load(fs.readFileSync("config.yaml", "utf8"));

const rows = 200;
const maxRetries = 3;

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

async function retryingFetch(url, fallbackUrl) {
  let attempt = 0;
  let current = url;
  while (attempt < maxRetries) {
    try {
      const res = await fetch(current);
      if (res.ok) return res;
      console.log(
        `Attempt ${attempt + 1} failed (${res.status}) for ${current}`,
      );
    } catch (e) {
      console.log(`Attempt ${attempt + 1} error for ${current}: ${e.message}`);
    }
    attempt++;
    if (attempt === 1 && fallbackUrl) {
      current = fallbackUrl; // switch to fallback once
      console.log(`Switching to fallback: ${current}`);
    } else {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error(`HTTP error after retries for ${url}`);
}

async function downloadFile(url, destPath) {
  try {
    if (fs.existsSync(destPath)) return destPath;
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(destPath, buf);
    return destPath;
  } catch (e) {
    console.warn(`Failed to download ${url}: ${e.message}`);
    return null;
  }
}

async function fetchDatasetFullRecord(id) {
  const primary = `${config.catalogue_url}/api/3/action/package_show?id=${encodeURIComponent(id)}`;
  const fallback = config.fallback_catalogue_url
    ? `${config.fallback_catalogue_url}/api/3/action/package_show?id=${encodeURIComponent(id)}`
    : null;
  const res = await retryingFetch(primary, fallback);
  const json = await res.json();
  return json.result;
}

async function fetchAllPackages() {
  const allResults = [];
  let start = 0;
  try {
    while (true) {
      const primary = `${config.catalogue_url}/api/3/action/package_search?q=${config.base_query}&rows=${rows}&start=${start}`;
      const fallback = config.fallback_catalogue_url
        ? `${config.fallback_catalogue_url}/api/3/action/package_search?q=${config.base_query}&rows=${rows}&start=${start}`
        : null;
      const res = await retryingFetch(primary, fallback);
      const data = await res.json();
      const batch = data.result.results || [];
      allResults.push(...batch);
      if (batch.length < rows) break;
      start += rows;
    }

    const datasetsDir = path.join("public", "datasets");
    const orgDir = path.join("public", "organizations");
    ensureDir(datasetsDir);
    ensureDir(orgDir);

    const candidates = allResults.filter((r) => r.spatial);
    const total = candidates.length;
    let processed = 0;
    const summaries = [];
    const useTTY = process.stdout.isTTY && !process.env.CI;
    const barWidth = 40;

    function render(note = "") {
      if (!useTTY) return;
      const ratio = total === 0 ? 1 : processed / total;
      const filled = Math.round(ratio * barWidth);
      const bar = `[${"#".repeat(filled)}${"-".repeat(barWidth - filled)}]`;
      const pct = (ratio * 100).toFixed(1).padStart(5, " ");
      process.stdout.write(`\r${bar} ${pct}% ${processed}/${total} ${note}`);
    }
    if (useTTY)
      console.log(`Harvesting ${total} datasets (full records + logos)...`);

    for (const item of candidates) {
      let note = item.name;
      try {
        const fullRecord = await fetchDatasetFullRecord(item.id);
        let orgImageLocal = null;
        const org = fullRecord.organization || {};
        if (org.image_url) {
          const imageUrl = org.image_url.startsWith("http")
            ? org.image_url
            : `${config.catalogue_url}${org.image_url}`;
          const orgFolder = path.join(
            orgDir,
            org.name ||
              createHash("md5")
                .update(org.title || org.id || "")
                .digest("hex"),
          );
          ensureDir(orgFolder);
          const ext = path.extname(imageUrl.split("?")[0]) || ".png";
          const localLogoPath = path.join(orgFolder, `logo${ext}`);
          const downloaded = await downloadFile(imageUrl, localLogoPath);
          if (downloaded)
            orgImageLocal = path
              .relative("public", downloaded)
              .replace(/\\/g, "/");
        }
        // Temporal extent
        const temporalExtent = fullRecord["temporal-extent"] || {};
        const firstExtent = Object.values(temporalExtent)[0] || {};
        const begin = firstExtent.begin || null;
        const end = firstExtent.end || null;
        if (orgImageLocal) {
          fullRecord.organization = fullRecord.organization || {};
          fullRecord.organization.image_local = orgImageLocal;
        }
        const datasetPath = path.join(datasetsDir, `${item.name}.json`);
        fs.writeFileSync(datasetPath, JSON.stringify(fullRecord), "utf8");
        summaries.push({
          id: item.id,
          name: item.name,
          title_translated: item.title_translated,
          project: item.projects,
          metadata_created: item.metadata_created,
          metadata_modified: item.metadata_modified,
          eov: item.eov,
          organization: (fullRecord["cited-responsible-party"] || []).map(
            (party) => ({
              name: party["organisation-name"],
              role: party.role,
              email: party["contact-info_email"],
              uri: party["organisation-uri_code"],
            }),
          ),
          temporal_extent: { begin, end },
          spatial: item.spatial,
        });
      } catch (e) {
        console.warn(`Skipping dataset ${item.id}: ${e.message}`);
        note = `${item.name}(skip)`;
      }
      processed++;
      if (useTTY) render(note);
      else if (processed % 25 === 0 || processed === total)
        console.log(`Processed ${processed}/${total}`);
    }
    if (useTTY) process.stdout.write("\n");
    const outPath = path.join("public", "packages.json");
    fs.writeFileSync(outPath, JSON.stringify(summaries, null, 2), "utf8");
    console.log(`Saved ${summaries.length} dataset summaries to ${outPath}`);
  } catch (err) {
    console.error("Error fetching packages:", err);
    process.exit(1);
  }
}

fetchAllPackages();
