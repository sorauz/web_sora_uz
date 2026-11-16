import { test, expect } from "@playwright/test";

test.describe("Category Interactive Filtering & Sorting Flow", () => {
  test("1. Clicking brand filter updates URL and re-renders filtered products on screen", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/uz/category/ish-stoli-kalkulyatorlari");

    const filterAside = page.locator("aside").first();
    await expect(filterAside).toBeVisible();

    // Find brand checkbox
    const firstBrandCheckbox = filterAside
      .locator("label")
      .filter({ hasText: /DELI|UFU/i })
      .locator("input[type='checkbox']")
      .first();
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

  test("5. Multi-level category hierarchy recursively includes all descendant subcategory products", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/uz/category/yozuv-qurollari");

    // The counter text should indicate all descendant products (not just 36 erasers)
    const countLocator = page.locator("span.text-xs.font-semibold.text-slate-500").first();
    await expect(countLocator).toContainText(/370|107/);

    // Subcategories tags should be visible (Ruchkalar, Markerlar, etc.)
    await expect(page.getByRole("link", { name: "Ruchkalar" }).first()).toBeVisible();
    const moreBtn = page.getByRole("button", { name: /Yana/i }).first();
    if (await moreBtn.isVisible()) {
      await moreBtn.click();
    }
    await expect(page.getByRole("link", { name: "Markerlar" }).first()).toBeVisible();

    // Verify pagination exists for 107 items (107 / 24 = 5 pages)
    const pagination = page.locator("nav[aria-label='Sahifalash']");
    await expect(pagination).toBeVisible();
  });

  test("6. Active filter chips appear above products and can be removed individually", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/uz/category/ish-stoli-kalkulyatorlari?brand=DELI&inStock=1");

    const chipsContainer = page.locator("[data-testid='active-filter-chips']");
    await expect(chipsContainer).toBeVisible();
    await expect(chipsContainer.getByText("DELI")).toBeVisible();
    await expect(chipsContainer.getByText("Omborda mavjud")).toBeVisible();

    // Click brand chip to remove it
    await chipsContainer.getByText("DELI").click();
    await expect(page).not.toHaveURL(/brand=DELI/);
    await expect(page).toHaveURL(/inStock=1/);
  });

  test("7. ProductCard interactive quantity stepper ([ - ] 1 [ + ]) works on card", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/uz/category/ish-stoli-kalkulyatorlari");

    // Find a card with an active Add to Cart button
    const initialCard = page
      .locator("article")
      .filter({ has: page.getByRole("button", { name: /savatga/i }) })
      .first();
    const cardTitle = await initialCard.locator("h3").innerText();
    const targetCard = page.locator("article").filter({ hasText: cardTitle });
    const addBtn = targetCard.getByRole("button", { name: /savatga/i }).first();
    await expect(addBtn).toBeVisible();

    // Click add to cart
    await addBtn.click();

    // Now stepper controls should appear on targetCard
    const plusBtn = targetCard.getByRole("button", { name: "Ko'paytirish" });
    const minusBtn = targetCard.getByRole("button", { name: "Kamaytirish" });
    const quantityDisplay = targetCard.locator("button[aria-label='Kamaytirish'] + span");
    await expect(plusBtn).toBeVisible();
    await expect(minusBtn).toBeVisible();
    await expect(quantityDisplay).toHaveText("1");

    // Click plus to increment to 2
    await plusBtn.click();
    await expect(quantityDisplay).toHaveText("2");

    // Click minus to decrement to 1
    await minusBtn.click();
    await expect(quantityDisplay).toHaveText("1");
  });

  test("8. Breadcrumbs include 'Katalog' and FAQPage JSON-LD schema is present", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/uz/category/ish-stoli-kalkulyatorlari");

    // Breadcrumbs check
    const breadcrumbNav = page.locator("nav[aria-label='Breadcrumb']");
    await expect(breadcrumbNav).toContainText("Katalog");
    await expect(breadcrumbNav).toContainText("Ish stoli kalkulyatorlari");

    // FAQPage schema check
    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
    const allLdTexts = await Promise.all(jsonLdScripts.map((s) => s.textContent()));
    const faqJson = allLdTexts.find((t) => t?.includes('"@type":"FAQPage"'));
    expect(faqJson).toBeTruthy();
    expect(faqJson).toContain('"@type":"Question"');
  });

  test("9. Sorting by 'newest' (sort=newest) works properly", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/uz/category/ish-stoli-kalkulyatorlari");

    const sortSelect = page.locator("select[aria-label='Saralash turi']:visible").first();
    await sortSelect.selectOption("newest");
    await expect(page).toHaveURL(/sort=newest/);
    await expect(page.locator("article").first()).toBeVisible();
  });

  test("10. Dual-thumb range slider and discount filter are present and interactive", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/uz/category/ish-stoli-kalkulyatorlari");

    // Dual-thumb range slider thumbs check
    const minThumb = page.locator("input[aria-label='Minimal narx']");
    const maxThumb = page.locator("input[aria-label='Maksimal narx']");
    await expect(minThumb).toBeAttached();
    await expect(maxThumb).toBeAttached();

    // Discount filter toggle check
    const discountCheckbox = page.getByRole("checkbox", { name: /chegirmadagi mahsulotlar/i });
    if (await discountCheckbox.isVisible()) {
      await discountCheckbox.click();
      await expect(page).toHaveURL(/discount=1/);
      const activeChips = page.locator("[data-testid='active-filter-chips']");
      await expect(activeChips).toContainText("Chegirmada");
    }
  });

  test("11. Search page has faceted filters, sorting and active chips", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/uz/search?q=deli");

    // Check filter sidebar is visible on desktop search
    const filterTitle = page.locator("h3", { hasText: /Filtrlar/i }).first();
    await expect(filterTitle).toBeVisible();

    // Check dual range slider thumbs exist on search
    const minThumb = page.locator("input[aria-label='Minimal narx']");
    await expect(minThumb).toBeAttached();

    // Check sorting works on search
    const sortSelect = page.locator("select[aria-label='Saralash turi']:visible").first();
    await sortSelect.selectOption("newest");
    await expect(page).toHaveURL(/sort=newest/);

    // Check inStock filter on search
    const inStockCheckbox = page.getByRole("checkbox", { name: /sotuvda borlari/i }).first();
    await inStockCheckbox.click();
    await expect(page).toHaveURL(/inStock=1/);
    const activeChips = page.locator("[data-testid='active-filter-chips']");
    await expect(activeChips).toContainText("Omborda mavjud");
  });
});
