const withFlowbiteReact = require("flowbite-react/plugin/nextjs");
const yaml = require("js-yaml");
const fs = require("fs");
const chroma = require("chroma-js");
const path = require("path");
const { execSync } = require("child_process");

// Load configuration from YAML
const config = yaml.load(fs.readFileSync("./config.yaml", "utf8"));

// Theme generation
const generateTheme = () => {
  const { primary_color, accent_color, light, dark } = config.theme;
  const markerColors = config.marker_colors;
  const colorSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  // Generate color palette for a specific color
  const generatePalette = (color, label) => {
    const palette = chroma.scale([light, color, dark]);
    return colorSteps
      .map((step) => `--color-${label}-${step}: ${palette(step / 1000).hex()};`)
      .join("\n");
  };

  // Generate marker colors CSS variables
  const generateMarkerColors = () => {
    if (!markerColors) {
      return "";
    }
    const lines = [
      "/* Marker Colors Configuration */",
      "/* Marker Color 1: Used for small clusters (1-10 markers) */",
      `--marker-color-1: ${markerColors.color1.background};`,
      `--marker-text-color-1: ${markerColors.color1.text};`,
      "/* Marker Color 2: Used for medium clusters (11-100 markers) */",
      `--marker-color-2: ${markerColors.color2.background};`,
      `--marker-text-color-2: ${markerColors.color2.text};`,
      "/* Marker Color 3: Used for large clusters (100+ markers) */",
      `--marker-color-3: ${markerColors.color3.background};`,
      `--marker-text-color-3: ${markerColors.color3.text};`,
    ];
    return lines.join("\n");
  };

  // Generate CSS content with both palettes and marker colors
  const cssContent = `@theme {
    ${generatePalette(primary_color, "primary")}
    ${generatePalette(accent_color, "accent")}
    ${generateMarkerColors()}
  }\n`;

  // Write to file
  const outputPath = path.join(__dirname, "./app/theme.css");
  fs.writeFileSync(outputPath, cssContent);

  console.log(
    `Color palette generated: primary=${primary_color}, accent=${accent_color}`,
  );
  if (markerColors) {
    console.log(
      `Marker colors generated: color1=${markerColors.color1.background}, color2=${markerColors.color2.background}, color3=${markerColors.color3.background}`,
    );
  }
};

// Copy favicon from public to app directory for Next.js to pick it up
const copyFavicon = () => {
  const sourcePath = path.join(
    __dirname,
    "public",
    config.favicon || "favicon.ico",
  );
  const destPath = path.join(__dirname, "app", "favicon.ico");

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Favicon copied to ${destPath}`);
  } else {
    console.warn(`Favicon source not found at ${sourcePath}`);
  }
};

copyFavicon();
// Generate theme colors
generateTheme();

// Determine base path from environment variable (set by GitHub Actions) or GitHub repository
// Priority: BASE_PATH env var > GITHUB_REPOSITORY
const basePath =
  process.env.BASE_PATH ||
  (process.env.GITHUB_REPOSITORY
    ? `/${process.env.GITHUB_REPOSITORY.split("/")[1]}`
    : "");

// Run markdown page existence check before build
try {
  execSync("node ./scripts/checkMarkdownPages.js", { stdio: "inherit" });
} catch (e) {
  console.error("Build failed: missing markdown_content files.");
  process.exit(1);
}

// Export Next.js configuration
module.exports = withFlowbiteReact({
  output: "export", // Enables static export
  images: { unoptimized: true },
  basePath,
  env: {
    CONFIG: JSON.stringify(config),
    BASE_PATH: basePath,
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
});
