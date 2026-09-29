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
  test("Catalog page renders category tree and brands from 1C", async ({ page }) => {
    await page.goto("/uz/catalog");
    await expect(page).toHaveTitle(/Katalog/);
    await expect(page.locator("h1")).toContainText("katalogi");
    await expect(page.getByText("Kalkulyatorlar").first()).toBeVisible();
  });

  test("Category page renders faceted filter and product cards from 1C", async ({ page }) => {
    await page.goto("/uz/category/ish-stoli-kalkulyatorlari");
    await expect(page.locator("h1")).toContainText("Ish stoli kalkulyatorlari");
    await expect(page.getByText("Filtrlar").first()).toBeVisible();
    await expect(page.getByText("DELI").first()).toBeVisible();
  });

  test("Brands directory and single brand page render from 1C", async ({ page }) => {
    await page.goto("/uz/brands");
    await expect(page.locator("h1")).toContainText("brendlar");
    await expect(page.getByText("DELI").first()).toBeVisible();

    await page.goto("/uz/brand/deli");
    await expect(page.locator("h1")).toContainText("DELI");
  });

  test("Search page works with query and displays results from 1C", async ({ page }) => {
    await page.goto("/uz/search?q=deli");
    await expect(page.locator("h1")).toContainText("deli");
    await expect(page.getByText("Deli").first()).toBeVisible();
  });
});
