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
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
