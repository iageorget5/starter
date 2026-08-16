import { expect, test } from "@playwright/test";

/**
 * Garde-fous génériques du design system — ce que ni axe-core ni Lighthouse
 * ne mesurent. Remontés d'agence-site (voir agence-context/LEARNINGS.md,
 * « les outils automatiques mesurent la présence, pas la justesse »).
 *
 * Compléter `PAGES` au fil des routes créées : un test de débordement qui ne
 * visite qu'une page ne prouve rien du reste du site.
 */
const PAGES = ["/"];

test.describe("design system", () => {
  test("aucun débordement horizontal, du plus petit au plus grand écran", async ({
    page,
  }) => {
    // Un débordement horizontal est un échec critique sur mobile, pas une
    // imperfection — et il se produit toujours au point le plus contraint
    // (un tableau, une valeur incompressible), jamais là où on regarde. Sur
    // agence-site, « 2 500 € » débordait de 9 px à 320 px : trouvé par ce
    // test, pas à l'œil.
    for (const [largeur, hauteur] of [
      [320, 640],
      [375, 667],
      [768, 1024],
      [1440, 900],
    ] as const) {
      await page.setViewportSize({ width: largeur, height: hauteur });
      for (const chemin of PAGES) {
        await page.goto(chemin);
        const debord = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(
          debord,
          `${chemin} deborde de ${String(debord)}px a ${String(largeur)}px`,
        ).toBeLessThanOrEqual(0);
      }
    }
  });

  test("la navigation marque la page courante", async ({ page }) => {
    // `aria-current` (WCAG 2.4.8) : ni axe-core ni Lighthouse ne signalent
    // son absence, parce qu'aucun des deux ne sait quelle page est ouverte.
    // À activer dès qu'une navigation multi-pages existe.
    test.skip(PAGES.length < 2, "une seule page : rien à marquer");
    for (const chemin of PAGES.slice(1)) {
      await page.goto(chemin);
      const courant = page.locator('nav a[aria-current="page"]').first();
      await expect(courant).toHaveAttribute("href", chemin);
    }
  });

  test("l'attribut hidden masque réellement, même sur un élément à display", async ({
    page,
  }) => {
    // Piège Tailwind : une classe d'auteur qui pose un `display` bat la règle
    // `[hidden]` du navigateur, et les utilitaires sont émis par ordre
    // alphabétique — `.hidden` sort avant `.inline-flex` et ne masque donc
    // plus rien. C'est la normalisation de global.css que ce test verrouille.
    // Sans elle, tout échange progressif affiche ses deux états à la fois.
    await page.goto("/");
    const masque = await page.evaluate(() => {
      const bouton = document.createElement("button");
      bouton.className = "inline-flex";
      bouton.hidden = true;
      document.documentElement.appendChild(bouton);
      const cache = getComputedStyle(bouton).display === "none";
      bouton.remove();
      return cache;
    });
    expect(masque).toBe(true);
  });
});
