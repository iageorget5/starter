import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";

export default defineConfig(
  { ignores: ["dist/**", ".astro/**"] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...astro.configs.recommended,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // Règle 1 : jamais de `any`
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-argument": "error",

      "no-restricted-syntax": [
        "error",
        // Règle 2 : composants fonction uniquement
        {
          selector: "ClassDeclaration[superClass.name=/Component|PureComponent/]",
          message: "Class components interdits : utiliser des composants fonction.",
        },
        // Règle 3 : pas de style inline
        {
          selector: "JSXAttribute[name.name='style']",
          message: "CSS inline interdit : utiliser les classes Tailwind.",
        },
      ],
    },
  },
  {
    files: ["eslint.config.js"],
    extends: [tseslint.configs.disableTypeChecked],
  }
);
