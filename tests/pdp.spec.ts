import { test, expect } from "@playwright/test";

test.describe("FAZA 3: Product Detail Page (PDP)", () => {
  test("Renders Uzbek PDP with Hero, Gallery, Actions, and Tabs", async ({ page }) => {
    await page.goto("/uz/products/deli-3871-boglash-mashinasi");

    // Title and Meta
    await expect(page).toHaveTitle(/Deli 3871/);
    await expect(page.locator("h1")).toContainText("Deli 3871");

    // Price & Brand
    await expect(page.getByText("DELI").first()).toBeVisible();
    await expect(page.getByText("Deli E3871").first()).toBeVisible();

    // Add to cart interactive action
    const addToCartBtn = page.getByRole("button", { name: /savatga qo'shish/i });
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();
    await expect(page.getByText(/savatga qo'shildi/i)).toBeVisible();

    // 1-Click Fast Order Modal
    const buyNowBtn = page.getByRole("button", { name: /1 klikda xarid qilish/i });
    await expect(buyNowBtn).toBeVisible();
    await buyNowBtn.click();

    // Modal opens - fill name and phone
    await expect(page.getByPlaceholder(/Masalan: Jasur/i)).toBeVisible();
    await page.getByPlaceholder(/Masalan: Jasur/i).fill("Jasur");
    await page.getByPlaceholder("+998 90 123 45 67").fill("+998 90 123 45 67");
    await page.getByRole("button", { name: /buyurtmani tasdiqlash/i }).click();
    await expect(page.getByText(/Rahmat!/i)).toBeVisible();

    // Check Tabs navigation
    await page.getByRole("button", { name: /texnik xususiyatlari/i }).click();
    await expect(page.getByRole("cell", { name: "Teshish quvvati" })).toBeVisible();

    await page.getByRole("button", { name: /sharhlar/i }).click();
    await expect(page.getByText("4.8").first()).toBeVisible();
    await expect(page.getByText(/Tasdiqlangan xaridor/i).first()).toBeVisible();

    // Check Distinct Up-sell / Cross-sell blocks
    await expect(
      page.getByText("O'xshash mahsulotlar (Muqobil variantlar)")
    ).toBeVisible();
    await expect(
      page.getByText("Bilan birga xarid qilinadi (To'ldiruvchi)")
    ).toBeVisible();
  });

  test("Renders Russian PDP with localized content and Schema.org JSON-LD", async ({ page }) => {
    await page.goto("/ru/products/deli-3871-perepletnye-mashiny");

    // Russian Title & Content
    await expect(page.locator("h1")).toContainText("Deli 3871");
    await expect(page.getByText("В корзину").first()).toBeVisible();
    await expect(page.getByText("Купить в 1 клик").first()).toBeVisible();

    // Verify JSON-LD script presence
    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
    expect(jsonLdScripts.length).toBeGreaterThanOrEqual(2);

    const firstJsonLd = await jsonLdScripts[0].textContent();
    expect(firstJsonLd).toContain('"@type":"Product"');
    expect(firstJsonLd).toContain('"sku":"Deli E3871"');
  });
});
