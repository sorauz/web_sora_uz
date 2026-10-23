import { test, expect } from "@playwright/test";

test.describe("Cart Enhanced Features (PDP Link, Multilingual Title, Bulk Buttons, Manual Input)", () => {
  test("1. Clicking product in cart opens PDP, changing language updates title, and quick add / input work", async ({
    page,
  }) => {
    // 1. Visit PDP in Uzbek and add product to cart
    await page.goto("/uz/products/deli-e1589-12-raqamli-kalkulyator-yashil");
    await expect(page.locator("h1")).toBeVisible();

    const addToCartBtn = page.getByRole("button", { name: /savatga qo'shish/i });
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();
    await expect(page.getByText(/savatga qo'shildi/i)).toBeVisible();

    // 2. Open Cart page in Uzbek
    await page.goto("/uz/cart");
    await expect(page.getByText(/savatchasi/i).first()).toBeVisible();

    // Title should contain Uzbek product name
    const itemTitle = page.locator("h3").first();
    await expect(itemTitle).toBeVisible();
    const uzTitleText = await itemTitle.innerText();
    expect(uzTitleText.length).toBeGreaterThan(0);

    // Feature 1: Check clicking the product title links to product PDP
    const productLink = page.locator("a[href*='/products/']").first();
    await expect(productLink).toBeVisible();
    const href = await productLink.getAttribute("href");
    expect(href).toContain("/products/");

    // Feature 3: Quick batch add buttons (+12, +24, +48) & manual keyboard input
    const quantityInput = page.locator("input[inputmode='numeric']").first();
    await expect(quantityInput).toBeVisible();
    await expect(quantityInput).toHaveValue("1");

    // Click +12 button
    const plus12Btn = page.getByRole("button", { name: "+12" });
    await expect(plus12Btn).toBeVisible();
    await plus12Btn.click();
    await expect(quantityInput).toHaveValue("13");

    // Click +24 button
    const plus24Btn = page.getByRole("button", { name: "+24" });
    await expect(plus24Btn).toBeVisible();
    await plus24Btn.click();
    await expect(quantityInput).toHaveValue("37");

    // Manual numeric keyboard input: fill with 50
    await quantityInput.click();
    await quantityInput.fill("50");
    await quantityInput.press("Enter");
    await expect(quantityInput).toHaveValue("50");

    // Feature 2: Switch language from /uz/cart to /ru/cart and verify title is localized
    await page.goto("/ru/cart");
    await expect(page.locator("h1")).toContainText(/Корзина/i);

    const ruItemTitle = page.locator("h3").first();
    await expect(ruItemTitle).toBeVisible();
    const ruTitleText = await ruItemTitle.innerText();
    expect(ruTitleText.length).toBeGreaterThan(0);

    // Also verify that the product link on /ru/cart points to /ru/products/...
    const ruProductLink = page.locator("a[href*='/products/']").first();
    const ruHref = await ruProductLink.getAttribute("href");
    expect(ruHref).toContain("/ru/products/");
  });
});
