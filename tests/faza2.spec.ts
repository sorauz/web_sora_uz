import { test, expect } from "@playwright/test";

test.describe("Sora.uz Home & i18n Tests", () => {
  test("renders /uz home page with Uzbek content and switches to /ru", async ({ page }) => {
    await page.goto("/uz");
    await expect(page).toHaveTitle(/Sora\.uz/);
    await expect(page.locator("h1")).toContainText("Ofis jihozlari va elektronika");

    // Check language switch
    await page.click("text=Русский");
    await page.waitForURL("**/ru");
    await expect(page.locator("h1")).toContainText("Офисная техника и электроника");
  });
});

test.describe("FAZA 2: Discovery (Catalog, Category, Brands, Search)", () => {
  test("Catalog page renders category tree and brands", async ({ page }) => {
    await page.goto("/uz/catalog");
    await expect(page).toHaveTitle(/Katalog/);
    await expect(page.locator("h1")).toContainText("katalogi");
    await expect(page.getByText("Ofis jihozlari va kanselyariya").first()).toBeVisible();
  });

  test("Category page renders faceted filter and product cards", async ({ page }) => {
    await page.goto("/uz/category/ofis-jihozlari-va-kanselyariya");
    await expect(page.locator("h1")).toContainText("Ofis jihozlari va kanselyariya");
    await expect(page.getByText("Filtrlar").first()).toBeVisible();
    await expect(page.getByText("DELI").first()).toBeVisible();
  });

  test("Brands directory and single brand page render", async ({ page }) => {
    await page.goto("/uz/brands");
    await expect(page.locator("h1")).toContainText("brendlar");
    await expect(page.getByText("Samsung").first()).toBeVisible();

    await page.goto("/uz/brand/deli");
    await expect(page.locator("h1")).toContainText("DELI");
  });

  test("Search page works with query and displays results", async ({ page }) => {
    await page.goto("/uz/search?q=deli");
    await expect(page.locator("h1")).toContainText("deli");
    await expect(page.getByText("Deli 3871").first()).toBeVisible();
  });
});
