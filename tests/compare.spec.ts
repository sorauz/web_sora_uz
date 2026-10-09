import { test, expect } from "@playwright/test";

test.describe("Product Comparison (Taqqoslash) System", () => {
  test("1. Empty comparison page displays friendly empty state and catalog link", async ({
    page,
  }) => {
    await page.goto("/uz/compare");

    // Title and empty state
    await expect(page).toHaveTitle(/Mahsulotlarni taqqoslash/i);
    await expect(page.locator("h2")).toContainText(/Taqqoslash ro'yxati bo'sh/i);

    const catalogBtn = page.getByRole("link", { name: /Katalogga o'tish/i });
    await expect(catalogBtn).toBeVisible();
    await catalogBtn.click();
    await expect(page).toHaveURL(/\/catalog/);
  });

  test("2. Can add products to compare from catalog and view in header badge", async ({
    page,
  }) => {
    await page.goto("/uz");

    // Header compare icon should initially have no badge or 0
    const compareHeaderLink = page.locator("header a[href*='/compare']");
    await expect(compareHeaderLink).toBeVisible();

    // Click compare button on first product card
    const firstProductCard = page.locator("article").first();
    const compareBtn = firstProductCard.locator("button[aria-label='Taqqoslash']");
    await expect(compareBtn).toBeVisible();
    await compareBtn.click();

    // Verify header badge updates to 1
    const badge = compareHeaderLink.locator("span");
    await expect(badge).toHaveText("1");

    // Add second product to compare
    const secondProductCard = page.locator("article").nth(1);
    const secondCompareBtn = secondProductCard.locator("button[aria-label='Taqqoslash']");
    await secondCompareBtn.click();

    // Verify badge updates to 2
    await expect(badge).toHaveText("2");

    // Navigate to /uz/compare
    await compareHeaderLink.click();
    await expect(page).toHaveURL(/\/compare/);

    // Verify both products are present in comparison table
    const table = page.locator("table");
    await expect(table).toBeVisible();
    await expect(table.locator("thead th").filter({ hasText: /so'm/i })).toHaveCount(2);

    // Verify base parameters row exists
    await expect(page.getByText("Asosiy ma'lumotlar")).toBeVisible();
    await expect(page.getByText("Narxi").first()).toBeVisible();
    await expect(page.getByText("Brend").first()).toBeVisible();

    // Toggle "Faqat farqlarni ko'rsatish"
    const diffToggle = page.getByRole("button", { name: /Faqat farqlarni ko'rsatish/i });
    await expect(diffToggle).toBeVisible();
    await diffToggle.click();
    await expect(page.getByRole("button", { name: /Barcha parametrlar/i })).toBeVisible();

    // Remove one product using X button
    const removeBtn = page.locator("button[aria-label='Remove']").first();
    await removeBtn.click();
    await expect(table.locator("thead th").filter({ hasText: /so'm/i })).toHaveCount(1);

    // Clear all
    const clearBtn = page.getByRole("button", { name: /Ro'yxatni tozalash/i });
    await clearBtn.click();

    // Back to empty state
    await expect(page.locator("h2")).toContainText(/Taqqoslash ro'yxati bo'sh/i);
  });

  test("3. PDP page has working Compare quick action button", async ({ page }) => {
    await page.goto("/uz/products/deli-e1589-12-raqamli-kalkulyator-yashil");

    // Compare action button on PDP
    const pdpCompareBtn = page.getByRole("button", { name: "Taqqoslashga qo'shish" });
    await expect(pdpCompareBtn).toBeVisible();
    await pdpCompareBtn.click();

    // Header badge should reflect 1 item
    const badge = page.locator("header a[href*='/compare'] span");
    await expect(badge).toHaveText("1");
  });
});
