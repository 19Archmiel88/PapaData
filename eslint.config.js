import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.pnpm-store/**",
      "**/generated/**"
    ]
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    plugins: {
      prettier
    },
    rules: {
      "prettier/prettier": "warn",

      // sensowne enterprise defaulty
      "no-console": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { "argsIgnorePattern": "^_" }
      ]
    }
  }
];
