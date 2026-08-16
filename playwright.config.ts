import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4321",
    trace: "on-first-retry",
  },
  webServer: {
    // Preview d'un build de prod, pas le serveur dev : le Dev Toolbar
    // d'Astro (shadow DOM injecté seulement en dev) fausserait les
    // assertions DOM (ex. comptage de <h1>) et les audits axe-core.
    command: "npm run build && npm run preview",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
  },
  // Deux moteurs. WebKit n'est pas du luxe : « le CSS bloque l'exécution des
  // scripts » est une garantie Chromium, pas une garantie du Web, et un bug
  // de course au chargement peut être visible à l'œil nu sur Safari/iOS tout
  // en restant invisible d'une suite mono-moteur — le test de non-régression
  // passe alors trivialement sur le code fautif.
  //
  // `npm run test:e2e` fixe explicitement `--project=chromium` : sans cela,
  // la seule présence du second projet ferait tourner les deux par défaut.
  // La CI leur donne un job séparé (voir .github/workflows/ci.yml) — deux
  // suites complètes contre la même instance de preview épuisent un runner
  // partagé. WebKit y est aussi mesurablement plus lent, d'où un essai de
  // plus.
  // Voir agence-context/DECISIONS.md (2026-08-15).
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      retries: process.env.CI ? 3 : 0,
    },
  ],
});
