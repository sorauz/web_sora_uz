import { test, expect } from "@playwright/test";

test.describe("FAZA 3: Product Detail Page (PDP) with Real 1C ERP Data", () => {
  test("Renders Uzbek PDP with Hero, Gallery, Actions, and Tabs from 1C", async ({ page }) => {
    await page.goto("/uz/products/deli-e1589-12-raqamli-kalkulyator-yashil");

    // Title and Meta from 1C
    await expect(page).toHaveTitle(/Deli E1589/);
    await expect(page.locator("h1")).toContainText("Deli E1589");

    // Price & Brand
    await expect(page.getByText("DELI").first()).toBeVisible();
    await expect(page.getByText("E1589").first()).toBeVisible();

    // Add to cart interactive action
    const addToCartBtn = page.getByRole("button", { name: /savatga qo'shish/i });
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();
    await expect(page.getByText(/savatga qo'shildi/i)).toBeVisible();

    // 1-Click Fast Order button is hidden for products < 200,000 UZS
    const buyNowBtn = page.getByRole("button", { name: /1 klikda xarid qilish/i });
    await expect(buyNowBtn).toHaveCount(0);

    // Check Tabs navigation (Specs from 1C)
    await page.getByRole("button", { name: /texnik xususiyatlari/i }).click();
    await expect(page.getByRole("cell", { name: /Artikul|Model/i }).first()).toBeVisible();

    await page.getByRole("button", { name: /sharhlar/i }).click();
    await expect(page.getByRole("button", { name: /savol-javoblar/i })).toBeVisible();

    // Check Distinct Up-sell / Cross-sell blocks
    await expect(
      page.getByText("O'xshash mahsulotlar").first()
    ).toBeVisible();
  });

  test("Renders Russian PDP with localized content and Schema.org JSON-LD from 1C", async ({ page }) => {
    await page.goto("/ru/products/deli-e1589-12-razryadnyy-kalkulyator-zelenyy");

    // Russian Title & Content
    await expect(page.locator("h1")).toContainText("Deli E1589");
    await expect(page.getByText("В корзину").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Купить в 1 клик" })).toHaveCount(0);

    // Verify JSON-LD script presence
    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
    expect(jsonLdScripts.length).toBeGreaterThanOrEqual(2);

    const allLdTexts = await Promise.all(jsonLdScripts.map((s) => s.textContent()));
    const productJson = allLdTexts.find((t) => t?.includes('"@type":"Product"'));
    expect(productJson).toBeTruthy();
    expect(productJson).toContain('"sku":"E1589"');
    expect(productJson).toContain('"category":');
    expect(productJson).toContain('"shippingDetails"');
    expect(productJson).toContain('"hasMerchantReturnPolicy"');
  });
});
