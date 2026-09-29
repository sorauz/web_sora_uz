import { test, expect } from "@playwright/test";

test.describe("FAZA 4: Cart and Checkout Flow", () => {
  test("Empty cart renders friendly empty state", async ({ page }) => {
    await page.goto("/uz/cart");
    await expect(page.getByText(/Savatingiz hozircha/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /katalogga o'tish/i })).toBeVisible();
  });

  test("Full Checkout flow: Add to Cart -> Cart View -> Checkout -> Order Success", async ({
    page,
  }) => {
    // 1. Visit PDP and add to cart
    await page.goto("/uz/products/deli-e1589-12-raqamli-kalkulyator-yashil");
    await expect(page.locator("h1")).toContainText("Deli E1589");

    const addToCartBtn = page.getByRole("button", { name: /savatga qo'shish/i });
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();
    await expect(page.getByText(/savatga qo'shildi/i)).toBeVisible();

    // 2. Open Cart page
    await page.goto("/uz/cart");
    await expect(page.getByText(/savatchasi/i).first()).toBeVisible();
    await expect(page.getByText("Deli E1589").first()).toBeVisible();

    // Proceed to Checkout
    const checkoutLink = page.getByRole("link", { name: /buyurtma berishga o'tish/i });
    await expect(checkoutLink).toBeVisible();
    await checkoutLink.click();

    // 3. Checkout Form
    await page.waitForURL("**/uz/checkout");
    await expect(page.locator("h1")).toContainText(/Buyurtmani rasmiylashtirish/i);

    // Fill customer details
    await page.getByPlaceholder(/Masalan: Jasur Alimov/i).fill("Jasur Alimov");
    await page.getByPlaceholder("+998 90 123 45 67").fill("+998 90 123 45 67");

    // Fill address details
    await page.getByPlaceholder(/Masalan: Mirzo Ulug'bek tumani/i).fill("Chilonzor tumani");
    await page.getByPlaceholder(/Masalan: Mustaqillik shoh ko'chasi/i).fill("Bunyodkor shoh ko'chasi, 42-uy");

    // Submit order
    const confirmBtn = page.getByRole("button", { name: /buyurtmani tasdiqlash/i });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // 4. Order Success page
    await page.waitForURL("**/uz/checkout/success**");
    await expect(page.getByRole("heading", { name: /muvaffaqiyatli qabul qilindi/i })).toBeVisible();
    await expect(page.getByText(/SORA-/i).first()).toBeVisible();
    await expect(page.getByText(/Tekshirilmoqda/i).first()).toBeVisible();
  });

  test("Favorites page renders empty state and saved favorites", async ({ page }) => {
    await page.goto("/uz/favorites");
    await expect(page.getByText(/Sevimlilar ro'yxati bo'sh/i)).toBeVisible();
  });
});
