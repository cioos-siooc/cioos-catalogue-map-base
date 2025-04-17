const withFlowbiteReact = require("flowbite-react/plugin/nextjs");
const yaml = require('js-yaml');
const fs = require('fs');
const chroma = require("chroma-js");
const path = require("path");

const config = yaml.load(fs.readFileSync('./config.yaml', 'utf8'));

// Generate custom theme colors
const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
function generateTailwindPalette(color, label) {
  const palette = chroma
    .scale(["white", color, "black"])
  const cssVariables = steps
    .map((step, i) => `--color-${label}-${step}: ${palette(step / 1000).hex()};`)
    .join("\n");

  return cssVariables;
}

function GenerateTheme() {
    const primaryColor = config.theme.primary_color;
    const accentColor = config.theme.accent_color;
    
    const cssContent = `@theme {
        ${generateTailwindPalette(primaryColor, 'gray')}
        ${generateTailwindPalette(accentColor, 'accent')}
        }\n`;
    
    const outputPath = path.join(__dirname, "./app/theme.css");
    
    fs.writeFileSync(outputPath, cssContent);
    console.log("Color custom palette with primary=" + primaryColor + " and accent=" + accentColor);
}
GenerateTheme();

const github_repository = process.env.GITHUB_REPOSITORY;
var basePath = ''
if (github_repository) {
    basePath = `/${github_repository.split('/')[1]}`;
}

module.exports = withFlowbiteReact({
    output: 'export', // Enables static export
    images: { unoptimized: true },
    basePath: basePath,
    env: {
        CONFIG: JSON.stringify(config),
        BASE_PATH: basePath,
    }
});