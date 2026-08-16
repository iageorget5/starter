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
  },
  {
    // Les outils de `scripts/` sont en JavaScript pur et importent des
    // paquets sans déclarations de types (sharp, ffmpeg-static…). Les règles
    // typées y voient `any` partout et produisent des dizaines d'erreurs dont
    // aucune ne désigne un vrai défaut — sur agence-site, 37 d'entre elles
    // ont masqué un `npm run check` rouge pendant plusieurs échanges. Le code
    // livré, lui, garde l'analyse complète.
    //
    // `document` et `setTimeout` sont déclarés parce que le corps des
    // `page.evaluate()` s'exécute dans la page, pas dans Node, et qu'ESLint
    // n'a aucun moyen de le savoir.
    files: ["scripts/**"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: {
        Buffer: "readonly",
        console: "readonly",
        process: "readonly",
        setTimeout: "readonly",
        document: "readonly",
      },
    },
  }
);
