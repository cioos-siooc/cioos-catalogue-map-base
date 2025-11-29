import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tailwindcss from "eslint-plugin-tailwindcss";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    plugins: {
      tailwindcss,
    },
    rules: {
      // Enforce canonical ordering of Tailwind classes inside className attributes
      "tailwindcss/classnames-order": "warn",
      // Optional: catch unknown classes (can be noisy if using arbitrary values)
      // "tailwindcss/no-custom-classname": "off",
    },
    settings: {
      tailwindcss: {
        // Next.js + Tailwind v4 default setup; allow props/className detection
        callees: ["classnames", "clsx"],
        config: "./tailwind.config.js",
      },
    },
  },
];

export default eslintConfig;
