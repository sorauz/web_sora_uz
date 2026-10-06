import { test, expect } from "@playwright/test";

test.describe("FAZA 6: Marketing, Feeds, Local SEO, and llms.txt", () => {
  test("llms.txt is accessible and complies with standard LLM documentation spec", async ({ request }) => {
    const res = await request.get("/llms.txt");
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain("# Sora.uz");
    expect(text).toContain("https://sora.uz/uz/catalog");
    expect(text).toContain("https://sora.uz/uz/delivery");
    expect(text).toContain("https://sora.uz/uz/contact");
    expect(text).toContain("https://sora.uz/uz/b2b");
    expect(text).toContain("https://sora.uz/uz/offers");
    expect(text).toContain("https://sora.uz/llms-full.txt");
  });

  test("llms-full.txt returns live dynamic catalog and product information for LLMs", async ({ request }) => {
    const res = await request.get("/llms-full.txt");
    expect(res.status()).toBe(200);
    const text = await res.text();
    expect(text).toContain("Sora.uz — To'liq Katalog");
    expect(text).toContain("Deli");
    expect(text).toContain("Kategoriyalar");
    expect(text).toContain("https://sora.uz/uz/b2b");
    expect(text).toContain("https://sora.uz/uz/offers");
    expect(text).toContain("https://sora.uz/uz/catalog/low_price_guarantee");
  });

  test("Google Merchant Center XML feed is valid and contains required product attributes", async ({
    request,
  }) => {
    const res = await request.get("/api/feeds/google-merchant");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect(xml).toContain('xmlns:g="http://base.google.com/ns/1.0"');
    expect(xml).toContain("<g:title>");
    expect(xml).toContain("<g:price>");
    expect(xml).toContain("UZS</g:price>");
    expect(xml).toContain("<g:availability>");
  });

  test("Yandex Market YML feed is valid and contains shop, categories, and offers", async ({ request }) => {
    const res = await request.get("/api/feeds/yandex-market");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect(xml).toContain("<yml_catalog");
    expect(xml).toContain("<shop>");
    expect(xml).toContain("<currencies>");
    expect(xml).toContain("<categories>");
    expect(xml).toContain("<offers>");
    expect(xml).toContain("<offer");
  });

  test("Trust & Local SEO pages (Delivery, Payment, Warranty, Contact, About, B2B) render with metadata", async ({
    page,
  }) => {
    // 1. Delivery
    await page.goto("/uz/delivery");
    await expect(page.locator("h1")).toContainText(/Yetkazib berish/i);

    // 2. Payment
    await page.goto("/uz/payment");
    await expect(page.locator("h1")).toContainText(/To'lov usullari/i);

    // 3. Warranty
    await page.goto("/uz/warranty");
    await expect(page.locator("h1")).toContainText(/Kafolat/i);

    // 4. Contact & LocalBusiness JSON-LD
    await page.goto("/uz/contact");
    await expect(page.locator("h1")).toContainText(/bog'laning/i);
    const contactJsonLd = await page.locator('script[type="application/ld+json"]').allInnerTexts();
    const hasStore = contactJsonLd.some((j) => j.includes('"@type":"Store"'));
    expect(hasStore).toBe(true);

    // 5. About Us
    await page.goto("/uz/about");
    await expect(page.locator("h1")).toContainText(/Sora.uz/i);

    // 6. B2B Corporate
    await page.goto("/uz/b2b");
    await expect(page.locator("h1")).toContainText(/Kanselyariya/i);
  });
});
