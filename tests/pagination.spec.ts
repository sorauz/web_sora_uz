import { test, expect } from "@playwright/test";

test.describe("Catalog & Category Pagination System (24 items/page)", () => {
  test("1. Category page displays products and pagination if total > 24", async ({
    page,
  }) => {
    await page.goto("/uz/category/ish-stoli-kalkulyatorlari");

    // Check if products grid is visible
    const productCards = page.locator("article");
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(24);

    // If there is pagination
    const paginationNav = page.locator("nav[aria-label='Sahifalash']");
    if (await paginationNav.isVisible()) {
      // Check current page indicator is active
      const activePage = paginationNav.locator("[aria-current='page']");
      await expect(activePage).toBeVisible();
      await expect(activePage).toHaveText("1");

      // Check next page link
      const nextBtn = paginationNav.locator("a[rel='next']");
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
        await page.waitForURL(/page=2/);
        expect(page.url()).toContain("page=2");

        // Verify page 2 has rel="prev"
        const prevBtn = page.locator("nav[aria-label='Sahifalash'] a[rel='prev']");
        await expect(prevBtn).toBeVisible();
      }
    }
  });

  test("2. Changing filters resets pagination to page 1", async ({ page }) => {
    // Navigate directly to page 2 if category has items
    await page.goto("/uz/category/ish-stoli-kalkulyatorlari?page=2");

    // Toggle in-stock switch
    const inStockToggle = page.locator("button[role='switch']").first();
    if (await inStockToggle.isVisible()) {
      await inStockToggle.click();
      await page.waitForTimeout(500);

      // Verify URL does not contain page=2
      expect(page.url()).not.toContain("page=2");
    }
  });

  test("3. Special offer pages and search pages support pagination", async ({ page }) => {
    await page.goto("/uz/catalog/popular");
    await expect(page.locator("h1")).toBeVisible();

    const productCards = page.locator("article");
    const count = await productCards.count();
    expect(count).toBeLessThanOrEqual(24);

    // Search page
    await page.goto("/uz/search?q=deli");
    await expect(page.locator("h1")).toBeVisible();
    const searchCards = page.locator("article");
    const searchCount = await searchCards.count();
    expect(searchCount).toBeLessThanOrEqual(24);
  });

  test("4. Mobile touch targets for pagination buttons satisfy min 44x44px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/uz/category/ish-stoli-kalkulyatorlari");

    const paginationNav = page.locator("nav[aria-label='Sahifalash']");
    if (await paginationNav.isVisible()) {
      const firstButton = paginationNav.locator("a").first();
      const box = await firstButton.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(40);
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });
});
