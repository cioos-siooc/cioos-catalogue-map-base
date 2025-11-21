const yaml = require("js-yaml");
const fs = require("fs");

// Load configuration from YAML
const config = yaml.load(fs.readFileSync("./config.yaml", "utf8"));
const themeConfig = config.theme;
console.log("Tailwind Config Loaded");
console.log("Theme Config:", JSON.stringify(themeConfig, null, 2));
console.log("Background Light:", themeConfig?.background?.light);

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/flowbite-react/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        "background-light": themeConfig?.background?.light || "#ffffff",
        "background-dark": themeConfig?.background?.dark || "#0a0a0a",
      },
    },
  },
  plugins: [
    require("flowbite-react/plugin"),
    require("@tailwindcss/typography"),
  ],
};
