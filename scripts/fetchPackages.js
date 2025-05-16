import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import fetch from "node-fetch"; // Ensure you've installed node-fetch@2

// Read config.yaml from the project root
const config = yaml.load(fs.readFileSync("config.yaml", "utf8"));

// Construct the CKAN API URL parameters
const rows = 200;
let start = 0;
const allResults = [];

// Maximum number of attempts per batch fetch
const maxRetries = 3;

async function fetchAllPackages() {
  try {
    while (true) {
      // Build the primary URL
      let fetchURL = `${config.catalogue_url}/api/3/action/package_search?q=${config.base_query}&rows=${rows}&start=${start}`;
      const fallbackURL = config.fallback_catalogue_url
        ? `${config.fallback_catalogue_url}/api/3/action/package_search?q=${config.base_query}&rows=${rows}&start=${start}`
        : null;

      console.log("Fetching from:", fetchURL);

      let response;
      let attempt = 0;
      let urlToFetch = fetchURL;
      while (attempt < maxRetries) {
        response = await fetch(urlToFetch);
        if (response.ok) {
          break;
        }
        attempt++;
        console.log(`Attempt ${attempt} failed for URL: ${urlToFetch}`);
        if (attempt === 1 && fallbackURL) {
          urlToFetch = fallbackURL;
          console.log("Switching to fallback URL:", urlToFetch);
        } else {
          // Optionally add a delay before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error after retries! Status: ${response.status}`);
      }

      const data = await response.json();
      // Append results to allResults
      allResults.push(...data.result.results);

      // Break if fewer results than the requested rows are returned
      if (data.result.results.length < rows) {
        break;
      }

      // Increment start for the next batch
      start += rows;
    }

    // Filter: only consider items with a non-empty "spatial" property
    // Create a new array with only the desired properties
    const filtered = allResults
      .filter((item) => item.spatial)
      .map((item) => {
        return {
          id: item.id,
          name: item.name,
          title_translated: item.title_translated,
          organization: {
            title_translated: item.organization.title_translated,
          },
          spatial: item.spatial,
        };
      });

    // Write the filtered result to disk
    const outputPath = path.join("public", "packages.json");
    fs.writeFileSync(outputPath, JSON.stringify(filtered), "utf8");
    console.log("Filtered packages saved to", outputPath);
  } catch (error) {
    console.error("Error fetching packages:", error);
  }
}

fetchAllPackages();
