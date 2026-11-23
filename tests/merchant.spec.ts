import { test, expect } from "@playwright/test";
import {
  getValidGtin,
  getValidMpn,
  resolveProductImageUrl,
  CDN_IMAGE_VERSION_FLOOR,
} from "../src/lib/utils/merchant";
import { AllProductsResponseSchema } from "../src/lib/schemas/product";

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

  test("3. Negotiable product (price=0) omits invalid Product/Offer JSON-LD & price meta while keeping BreadcrumbList and og:image", async ({
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

    // Must NOT emit a Product JSON-LD with missing offers/review/aggregateRating or price=0
    const jsonLdScripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const productLdText = jsonLdScripts.find((t) =>
      t.includes('"@type":"Product"')
    );
    if (productLdText) {
      const productLd = JSON.parse(productLdText);
      expect(
        Boolean(
          (productLd.offers && productLd.offers.price > 0) ||
            productLd.review ||
            productLd.aggregateRating
        )
      ).toBe(true);
      if (productLd.offers) {
        expect(typeof productLd.offers.price).toBe("number");
        expect(productLd.offers.price).toBeGreaterThan(0);
      }
    }

    // BreadcrumbList JSON-LD must still be present
    const breadcrumbLdText = jsonLdScripts.find((t) =>
      t.includes('"@type":"BreadcrumbList"')
    );
    expect(breadcrumbLdText).toBeTruthy();
  });

  test("4. Compact 1C /all_product schema (sku, pic, up_date, alt_uz, alt_ru) normalizes identically to legacy keys", () => {
    const parsed = AllProductsResponseSchema.parse([
      {
        id: "08fb26ce-7785-11f1-a5aa-00155dbd2903",
        sku: "100149693",
        barcode: "",
        brand: "DELI",
        country: "Xitoy",
        pic: "https://cdn.sora.uz/products/000002188_1.jpg",
        up_date: "2026-11-04T00:00:00",
        uz: {
          unit_uz: "dona",
          category_uz: "Savdo uchun uskunalar",
          category_slug_uz: "savdo-uchun-uskunalar",
          alt_uz: "Deli E3904 pul hisoblagich",
          name_uz: "Deli E3904 pul hisoblagich",
          slug_uz: "deli-e3904-pul-hisoblagich",
        },
        ru: {
          unit_ru: "шт",
          category_ru: "Оборудование для торговли",
          category_slug_ru: "oborudovanie-dlya-torgovli",
          alt_ru: "Deli E3904 счётчик наличных",
          name_ru: "Deli E3904 счётчик наличных",
          slug_ru: "deli-e3904-schetchik-nalichnyh",
        },
      },
      {
        id: "legacy-id",
        product_sku: "E1589",
        barcode: "",
        brand: "DELI",
        country: "Xitoy",
        main_picture: "https://cdn.sora.uz/products/000001589_1.jpg",
        updated_at: "2026-11-05T00:00:00",
        uz: {
          unit_uz: "dona",
          category_uz: "Kalkulyatorlar",
          category_slug_uz: "kalkulyatorlar",
          alt_picture_uz: "Deli E1589",
          name_uz: "Deli E1589",
          slug_uz: "deli-e1589",
        },
        ru: {
          unit_ru: "шт",
          category_ru: "Калькуляторы",
          category_slug_ru: "kalkulyatory",
          alt_picture_ru: "Deli E1589 RU",
          name_ru: "Deli E1589 RU",
          slug_ru: "deli-e1589-ru",
        },
      },
    ]);

    expect(parsed[0].product_sku).toBe("100149693");
    expect(parsed[0].main_picture).toBe(
      "https://cdn.sora.uz/products/000002188_1.jpg"
    );
    expect(parsed[0].updated_at).toBe("2026-11-04T00:00:00");
    expect(parsed[0].uz.alt_picture_uz).toBe("Deli E3904 pul hisoblagich");
    expect(parsed[0].ru.alt_picture_ru).toBe("Deli E3904 счётчик наличных");

    expect(parsed[1].product_sku).toBe("E1589");
    expect(parsed[1].main_picture).toBe(
      "https://cdn.sora.uz/products/000001589_1.jpg"
    );
    expect(parsed[1].updated_at).toBe("2026-11-05T00:00:00");
    expect(parsed[1].uz.alt_picture_uz).toBe("Deli E1589");
    expect(parsed[1].ru.alt_picture_ru).toBe("Deli E1589 RU");
  });
});
