import { test, expect } from "@playwright/test";

test.describe("1C ERP User Auth, Password Validation & B2C/B2B Flows", () => {
  test("1. Header User icon opens AuthModal with Login and Register tabs", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/uz");

    // Click User icon in Header
    const userBtn = page.getByRole("button", { name: /kirish/i }).first();
    await expect(userBtn).toBeVisible();
    await userBtn.click();

    // Verify modal appears
    const modal = page.locator(".fixed.inset-0");
    await expect(modal).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tizimga kirish" })).toBeVisible();

    // Switch to Register tab
    await modal.getByRole("button", { name: "Ro'yxatdan o'tish" }).first().click();
    await expect(page.getByRole("heading", { name: "Ro'yxatdan o'tish" })).toBeVisible();
    await expect(page.getByPlaceholder(/Jasur Karimov/i)).toBeVisible();
    await expect(page.getByText(/Tashkilot \(B2B\) nomidan xarid qilmoqchimisiz\?/i)).toBeVisible();

    // Switch back to Login tab and test B2C / B2B toggle
    await modal.getByRole("button", { name: "Kirish" }).first().click();
    await expect(page.getByPlaceholder("+998 90 123 45 67")).toBeVisible();

    // Select B2B Yuridik shaxs
    await modal.getByRole("button", { name: /Yuridik shaxs \(INN\)/i }).click();
    await expect(page.getByPlaceholder("123456789")).toBeVisible();
  });

  test("2. Login returns 401 Unauthorized for incorrect password and 404 for unknown user", async ({
    page,
  }) => {
    await page.goto("/uz");

    // Open Login Modal
    await page.getByRole("button", { name: /kirish/i }).first().click();

    // Attempt login with wrong password
    await page.getByPlaceholder("+998 90 123 45 67").fill("+998 90 326 54 58");
    await page.getByPlaceholder("••••••••").fill("wrongpassword_999");
    await page.locator("form").getByRole("button", { name: /kirish/i }).click();

    // Expect error message
    await expect(page.getByText(/noto'g'ri parol/i)).toBeVisible();

    // Attempt login with unknown user
    await page.getByPlaceholder("+998 90 123 45 67").fill("+998 99 000 00 00");
    await page.locator("form").getByRole("button", { name: /kirish/i }).click();

    // Expect 404 user not found error
    await expect(page.getByText(/foydalanuvchi topilmadi/i)).toBeVisible();
  });

  test("3. Checkout page displays Login banner and B2C/B2B dynamic switcher", async ({
    page,
  }) => {
    // Add product to cart first
    await page.goto("/uz/products/deli-e1589-12-raqamli-kalkulyator-yashil");
    await page.getByRole("button", { name: /savatga qo'shish/i }).click();
    await expect(page.getByText(/savatga qo'shildi/i)).toBeVisible();

    // Go to checkout
    await page.goto("/uz/checkout");
    await expect(page.locator("h1")).toContainText(/Buyurtmani rasmiylashtirish/i);

    // Verify Guest login banner is visible
    await expect(page.getByText(/Doimiy xaridormisiz\?/i)).toBeVisible();

    // Verify B2C / B2B order switcher buttons
    const b2cBtn = page.getByRole("button", { name: /Jismoniy shaxs \(B2C\)/i });
    const b2bBtn = page.getByRole("button", { name: /Tashkilot nomidan \(B2B\)/i });
    await expect(b2cBtn).toBeVisible();
    await expect(b2bBtn).toBeVisible();

    // Click B2B switcher
    await b2bBtn.click();

    // Verify B2B Company name and INN fields appear
    await expect(page.getByPlaceholder(/«Navruz International» MCHJ/i)).toBeVisible();
    await expect(page.getByPlaceholder("204393073")).toBeVisible();
  });
});
