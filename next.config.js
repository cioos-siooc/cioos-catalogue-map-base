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
  const colorSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  // Generate color palette for a specific color
  const generatePalette = (color, label) => {
    const palette = chroma.scale([light, color, dark]);
    return colorSteps
      .map((step) => `--color-${label}-${step}: ${palette(step / 1000).hex()};`)
      .join("\n");
  };

  // Generate CSS content with both palettes
  const themeConfig = config.theme;
  const cssContent = `@theme {
    ${generatePalette(primary_color, "primary")}
    ${generatePalette(accent_color, "accent")}
    --color-background-light:  ${themeConfig?.background?.light || "var(--color-primary-50)"};
    --color-background-dark: ${themeConfig?.background?.dark || "var(--color-primary-800)"};
    --color-ui-light: ${themeConfig?.ui?.light || "var(--color-primary-200)"};
    --color-ui-dark: ${themeConfig?.ui?.dark || "var(--color-primary-700)"};
    --color-ui-text-light: ${themeConfig?.ui?.text_light || "var(--color-neutral-950)"};
    --color-ui-text-dark: ${themeConfig?.ui?.text_dark || "var(--color-neutral-50)"};
    --color-accent-text: ${themeConfig?.accent_text_color || "black"};
  }\n`;

  // Write to file
  const outputPath = path.join(__dirname, "./app/theme.css");
  fs.writeFileSync(outputPath, cssContent);

  console.log(
    `Color palette generated: primary=${primary_color}, accent=${accent_color}`,
  );
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
// Priority: BASE_PATH env var > GITHUB_PAGES_URL > GITHUB_REPOSITORY
let basePath;

// Check if BASE_PATH is explicitly set (including empty string)
if (process.env.BASE_PATH !== undefined) {
  basePath = process.env.BASE_PATH;
  console.log(`Using explicit BASE_PATH: ${basePath || "<empty>"}`);
} else if (process.env.GITHUB_PAGES_URL) {
  // Extract base path from GitHub Pages URL
  // Examples:
  //   - https://username.github.io/repo-name/ -> /repo-name (subdomain deployment)
  //   - https://cataloguemap.cioos.ca/ -> "" (custom domain - no basePath)
  try {
    const pagesUrl = new URL(process.env.GITHUB_PAGES_URL);

    // Only use basePath if it's a github.io subdomain deployment
    // Custom domains should have empty basePath
    if (pagesUrl.hostname.endsWith(".github.io")) {
      basePath = pagesUrl.pathname.replace(/\/$/, ""); // Remove trailing slash
      console.log(`GitHub.io subdomain detected - basePath: ${basePath}`);
    } else {
      // Custom domain - no basePath needed
      basePath = "";
      console.log(
        `Custom domain detected (${pagesUrl.hostname}) - basePath: <empty>`,
      );
    }
  } catch (e) {
    console.warn("Failed to parse GITHUB_PAGES_URL:", e);
    basePath = undefined;
  }
} else if (process.env.GITHUB_REPOSITORY) {
  basePath = `/${process.env.GITHUB_REPOSITORY.split("/")[1]}`;
  console.log(`Using GITHUB_REPOSITORY fallback - basePath: ${basePath}`);
} else {
  basePath = "";
  console.log("No deployment info found - basePath: <empty>");
}

// Ensure basePath is always a string
basePath = basePath || "";

if (basePath) {
  console.log(`Final basePath configuration: ${basePath}`);
} else {
  console.log("Final basePath configuration: <empty> (root deployment)");
}

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
