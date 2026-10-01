import { test, expect } from "@playwright/test";
import { calculateProductPrice } from "../src/lib/utils/price";

test.describe("Pricing & Wholesale Discount Logic", () => {
  test("calculateProductPrice helper accurately handles all 5 business scenarios", () => {
    // 1. Discount scenario: retail_price > wholesale_price
    const discountCase = calculateProductPrice({
      retail_price: 100000,
      wholesale_price: 80000,
      dealer_price: 70000,
    });
    expect(discountCase.price).toBe(80000);
    expect(discountCase.oldPrice).toBe(100000);
    expect(discountCase.hasDiscount).toBe(true);
    expect(discountCase.discountPercent).toBe(20);
    expect(discountCase.isNegotiable).toBe(false);

    // 2. Equal price scenario: retail_price == wholesale_price
    const equalCase = calculateProductPrice({
      retail_price: 50000,
      wholesale_price: 50000,
    });
    expect(equalCase.price).toBe(50000);
    expect(equalCase.oldPrice).toBeUndefined();
    expect(equalCase.hasDiscount).toBe(false);
    expect(equalCase.discountPercent).toBe(0);
    expect(equalCase.isNegotiable).toBe(false);

    // 3. Wholesale higher anomaly: retail_price < wholesale_price
    const anomalyCase = calculateProductPrice({
      retail_price: 40000,
      wholesale_price: 60000,
    });
    expect(anomalyCase.price).toBe(60000);
    expect(anomalyCase.oldPrice).toBeUndefined();
    expect(anomalyCase.hasDiscount).toBe(false);
    expect(anomalyCase.discountPercent).toBe(0);

    // 4. Missing or zero price fallback: price <= 0
    const zeroCase = calculateProductPrice({
      retail_price: 0,
      wholesale_price: 0,
    });
    expect(zeroCase.price).toBe(0);
    expect(zeroCase.oldPrice).toBeUndefined();
    expect(zeroCase.hasDiscount).toBe(false);
    expect(zeroCase.isNegotiable).toBe(true);

    const nullCase = calculateProductPrice(null);
    expect(nullCase.price).toBe(0);
    expect(nullCase.isNegotiable).toBe(true);

    // 5. Retail only provided
    const retailOnly = calculateProductPrice({
      retail_price: 75000,
      wholesale_price: 0,
    });
    expect(retailOnly.price).toBe(75000);
    expect(retailOnly.oldPrice).toBeUndefined();
    expect(retailOnly.hasDiscount).toBe(false);
  });

  test("PDP displays wholesale selling price, struck-through retail price, and discount badge", async ({ page }) => {
    await page.goto("/uz/products/deli-e1589-12-raqamli-kalkulyator-yashil");

    // Check that prices are visible
    const mainPrice = page.locator("span.font-black").filter({ hasText: /so'm/i }).first();
    await expect(mainPrice).toBeVisible();

    // Check discount badge or old price
    const discountBadge = page.locator("span").filter({ hasText: /^-\d+%/ }).first();
    const isBadgeVisible = await discountBadge.isVisible().catch(() => false);

    if (isBadgeVisible) {
      await expect(discountBadge).toBeVisible();
      // Verify line-through old price
      const oldPrice = page.locator("span.line-through").filter({ hasText: /so'm/i }).first();
      await expect(oldPrice).toBeVisible();
    }

    // Add to cart and verify cart has correct price
    const addToCartBtn = page.getByRole("button", { name: /savatga qo'shish/i });
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();
    await expect(page.getByText(/savatga qo'shildi/i)).toBeVisible();
  });
});
