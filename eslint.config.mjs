import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        structuredClone: "readonly",
      },
    },
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "react/display-name": "warn",
    },
  },
];

export default eslintConfig;
