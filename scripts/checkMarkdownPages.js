// scripts/checkMarkdownPages.js
// Checks that all markdown_content files referenced in config.yaml exist
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const config = yaml.load(
  fs.readFileSync(path.join(__dirname, "../config.yaml"), "utf8"),
);

let missing = [];

if (Array.isArray(config.pages)) {
  config.pages.forEach((page, idx) => {
    if (page.markdown_content) {
      for (const lang of Object.keys(page.markdown_content)) {
        const relPath = page.markdown_content[lang];
        // Remove leading slash if present, and always check relative to public/
        const filePath = path.join(
          __dirname,
          "../public",
          relPath.replace(/^\//, ""),
        );
        if (!fs.existsSync(filePath)) {
          missing.push({ idx, lang, filePath });
        }
      }
    }
  });
}

if (missing.length > 0) {
  console.error("Missing markdown_content files:");
  missing.forEach(({ idx, lang, filePath }) => {
    console.error(`  Page index ${idx}, lang ${lang}: ${filePath}`);
  });
  process.exit(1);
} else {
  console.log("All markdown_content files exist.");
}
