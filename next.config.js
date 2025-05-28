const withFlowbiteReact = require("flowbite-react/plugin/nextjs");
const yaml = require("js-yaml");
const fs = require("fs");
const chroma = require("chroma-js");
const path = require("path");

// Load configuration from YAML
const config = yaml.load(fs.readFileSync("./config.yaml", "utf8"));

// Theme generation
const generateTheme = () => {
  const { primary_color, accent_color, light, dark } = config.theme;
  const colorSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  // Generate color palette for a specific color
  const generatePalette = (color, label) => {
    const palette = chroma.scale([light, color, dark]);
    return colorSteps
      .map((step) => `--color-${label}-${step}: ${palette(step / 1000).hex()};`)
      .join("\n");
  };

  // Generate CSS content with both palettes
  const cssContent = `@theme {
    ${generatePalette(primary_color, "primary")}
    ${generatePalette(accent_color, "accent")}
  }\n`;

  // Write to file
  const outputPath = path.join(__dirname, "./app/theme.css");
  fs.writeFileSync(outputPath, cssContent);

  console.log(
    `Color palette generated: primary=${primary_color}, accent=${accent_color}`,
  );
};

// Generate theme colors
generateTheme();

// Determine base path from GitHub repository (if any)
const githubRepository = process.env.GITHUB_REPOSITORY;
const basePath = githubRepository ? `/${githubRepository.split("/")[1]}` : "";

// Export Next.js configuration
module.exports = withFlowbiteReact({
  output: "export", // Enables static export
  images: { unoptimized: true },
  basePath,
  env: {
    CONFIG: JSON.stringify(config),
    BASE_PATH: basePath,
  },
});
