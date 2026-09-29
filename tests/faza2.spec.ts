import { test, expect } from "@playwright/test";

test.describe("FAZA 2: Discovery (Catalog, Category, Brands, Search)", () => {
  test("Catalog page renders all category sections and brands", async ({ page }) => {
    await page.goto("/uz/catalog");
    await expect(page).toHaveTitle(/Katalog/);
    await expect(page.locator("h1")).toContainText("katalogi");
    await expect(page.getByText("Ofis jihozlari va kanselyariya")).toBeVisible();
    await expect(page.getByText("Smartfonlar")).toBeVisible();
  });

  test("Category page renders faceted filter and product grid", async ({ page }) => {
    await page.goto("/uz/category/ofis-jihozlari-va-kanselyariya");
    await expect(page.locator("h1")).toContainText("Ofis jihozlari va kanselyariya");
    await expect(page.getByText("Filtrlar")).toBeVisible();
    await expect(page.getByText("DELI")).toBeVisible();
  });

  test("Brands directory and single brand page render", async ({ page }) => {
    await page.goto("/uz/brands");
    await expect(page.locator("h1")).toContainText("brendlar");
    await expect(page.getByText("Samsung")).toBeVisible();

    await page.goto("/uz/brand/deli");
    await expect(page.locator("h1")).toContainText("DELI");
  });

  test("Search page works with query and displays results", async ({ page }) => {
    await page.goto("/uz/search?q=Deli");
    await expect(page.locator("h1")).toContainText("Deli");
    await expect(page.getByText("Deli E3871")).toBeVisible();
  });
});
