import js from "@eslint/js";
import { globalIgnores } from "eslint/config";
import importPlugin from "eslint-plugin-import";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  globalIgnores(["dist", "node_modules"]),
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs["recommended-latest"],
  reactRefresh.configs.vite,
  eslintPluginPrettierRecommended,
  importPlugin.flatConfigs.typescript,
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "arrow-body-style": ["error", "as-needed"],
      "prettier/prettier": ["warn"],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "import/no-cycle": ["error", { maxDepth: 10 }],
      "import/order": [
        "warn",
        {
          groups: [
            ["external", "builtin"],
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          pathGroups: [
            { pattern: "@/assets/**", group: "internal", position: "after" },
            { pattern: "@/libs/**", group: "internal", position: "after" },
            { pattern: "@/api/**", group: "internal", position: "after" },
            { pattern: "@/screens/**", group: "internal", position: "after" },
            { pattern: "@/routes/**", group: "internal", position: "after" },
            {
              pattern: "@/components/**",
              group: "internal",
              position: "after",
            },
            { pattern: "@/modules/**", group: "internal", position: "after" },
            { pattern: "@/**", group: "internal", position: "after" },
            { pattern: "./*.module.scss", group: "sibling", position: "after" },
            { pattern: "./*.scss", group: "sibling", position: "after" },
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
  },
];
