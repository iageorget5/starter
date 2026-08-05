import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("home : rendu, a11y, pas de brouillon", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByText("[DRAFT]")).toHaveCount(0);

  const a11y = await new AxeBuilder({ page }).analyze();
  expect(a11y.violations).toEqual([]);
  expect(errors).toEqual([]);
});
