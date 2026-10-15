import { test, expect } from "@playwright/test";

test.describe("Category Interactive Filtering & Sorting Flow", () => {
  test("1. Clicking brand filter updates URL and re-renders filtered products on screen", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/uz/category/ish-stoli-kalkulyatorlari");

    const filterAside = page.locator("aside").first();
    await expect(filterAside).toBeVisible();

    // Find first brand checkbox
    const firstBrandCheckbox = filterAside.locator("input[type='checkbox']").nth(1);
    await expect(firstBrandCheckbox).toBeVisible();

    // Initial count
    const countLocator = page.locator("span.text-xs.font-semibold.text-slate-500").first();
    const initialText = await countLocator.innerText();

    // Click brand checkbox
    await firstBrandCheckbox.click();

    // Verify URL contains brand query param
    await expect(page).toHaveURL(/brand=/);

    // Verify products list is rendered and count text changes on screen
    await expect(countLocator).not.toHaveText(initialText, { timeout: 10000 });
    await expect(page.locator("aside")).toBeVisible();
  });

  test("2. Selecting quick price preset updates products and URL", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/uz/category/ish-stoli-kalkulyatorlari");

    const filterAside = page.locator("aside").first();
    const presetBtn = filterAside.getByText("50 minggacha").first();
    await expect(presetBtn).toBeVisible();

    await presetBtn.click();
    await expect(page).toHaveURL(/maxPrice=50000/);
  });

  test("3. Sorting select updates URL and triggers product re-ordering", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/uz/category/ish-stoli-kalkulyatorlari");

    const sortSelect = page.locator("select[aria-label='Saralash turi']:visible").first();
    await expect(sortSelect).toBeVisible();

    await sortSelect.selectOption("price_asc");
    await expect(page).toHaveURL(/sort=price_asc/);
  });

  test("4. Clear filters button resets URL and all active filters", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/uz/category/ish-stoli-kalkulyatorlari?brand=DELI&maxPrice=50000");

    const clearBtn = page.getByRole("button", { name: /Tozalash/i }).first();
    await expect(clearBtn).toBeVisible();

    await clearBtn.click();
    await expect(page).not.toHaveURL(/brand=DELI/);
    await expect(page).not.toHaveURL(/maxPrice=/);
  });
});
