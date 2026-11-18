import { test, expect } from "@playwright/test";
import {
  getValidGtin,
  getValidMpn,
  resolveProductImageUrl,
  CDN_IMAGE_VERSION_FLOOR,
} from "../src/lib/utils/merchant";

test.describe("Google Merchant & Product Structured Data Hygiene", () => {
  test("1. Unit helpers validate GTIN checksums, sanitize MPN, and version CDN image URLs", () => {
    // Valid GS1 barcodes
    expect(getValidGtin("4605817132201")).toBe("4605817132201");
    expect(getValidGtin(" 6921734901385 ")).toBe("6921734901385");

    // Broken / internal / placeholder barcodes must be rejected
    expect(getValidGtin("000000000000000000")).toBeUndefined();
    expect(getValidGtin("17000000412")).toBeUndefined();
    expect(getValidGtin("691734920539")).toBeUndefined(); // invalid check digit
    expect(getValidGtin("2000000000015")).toBeUndefined(); // internal EAN-13 prefix 2x
    expect(getValidGtin("")).toBeUndefined();

    // MPN / SKU sanitization
    expect(getValidMpn("E1589")).toBe("E1589");
    expect(getValidMpn("N/A")).toBeUndefined();
    expect(getValidMpn(" n/a ")).toBeUndefined();
    expect(getValidMpn("-")).toBeUndefined();
    expect(getValidMpn("")).toBeUndefined();

    // CDN image versioning & empty fallback
    expect(
      resolveProductImageUrl("https://cdn.sora.uz/products/000002188_1.jpg", {
        updatedAt: "2026-10-17T00:00:00",
      })
    ).toBe(
      `https://cdn.sora.uz/products/000002188_1.jpg?v=${CDN_IMAGE_VERSION_FLOOR}`
    );

    expect(
      resolveProductImageUrl("https://cdn.sora.uz/products/000002188_1.jpg", {
        updatedAt: "2027-02-15T12:00:00",
      })
    ).toBe("https://cdn.sora.uz/products/000002188_1.jpg?v=20270215");

    expect(resolveProductImageUrl("")).toBe("https://sora.uz/og-image.jpg");
  });

  test("2. Google Merchant XML feed emits versioned images, valid GTINs, and zero placeholder MPN/0-prices", async ({
    request,
  }) => {
    const res = await request.get("/api/feeds/google-merchant");
    expect(res.status()).toBe(200);
    const xml = await res.text();

    // Must contain valid versioned CDN image_link
    expect(xml).toMatch(/<g:image_link>https:\/\/cdn\.sora\.uz\/products\/[^<]+\?v=\d{8}<\/g:image_link>/);

    // Must contain valid <g:gtin> tags for products with authentic GS1 barcodes
    expect(xml).toContain("<g:gtin>");

    // Must NEVER leak invalid placeholder values into feed
    expect(xml).not.toContain("<g:mpn>N/A</g:mpn>");
    expect(xml).not.toContain("<g:gtin>000000");
    expect(xml).not.toContain("<g:gtin>17000000412</g:gtin>");
    expect(xml).not.toContain("<g:price>0 UZS</g:price>");
  });

  test("3. Negotiable product (price=0) omits 0 UZS Offer & price meta while keeping clean Product JSON-LD", async ({
    page,
  }) => {
    // Deli E1710A is a real 1C product with price=0 ("Narxi kelishiladi")
    await page.goto("/uz/products/deli-e1710a-qizil-ilmiy-kalkulyator");

    await expect(page.getByText(/narxi kelishiladi/i).first()).toBeVisible();

    // Should NOT leak product:price:amount="0"
    await expect(
      page.locator('meta[property="product:price:amount"]')
    ).toHaveCount(0);

    // og:image must have versioned CDN URL (never bare https://sora.uz)
    const ogImg = await page
      .locator('meta[property="og:image"]')
      .first()
      .getAttribute("content");
    expect(ogImg).toContain("cdn.sora.uz/products/");
    expect(ogImg).toMatch(/\?v=\d{8}/);

    // Product JSON-LD must NOT emit "price":0 Offer
    const jsonLdScripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const productLdText = jsonLdScripts.find((t) =>
      t.includes('"@type":"Product"')
    );
    expect(productLdText).toBeTruthy();
    const productLd = JSON.parse(productLdText!);
    expect(productLd.offers).toBeUndefined();
    expect(productLd.image).toMatch(/\?v=\d{8}/);
  });
});
