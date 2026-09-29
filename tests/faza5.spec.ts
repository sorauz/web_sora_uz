import { test, expect } from "@playwright/test";

test.describe("FAZA 5: Technical SEO, Canonical Redirection, and Price Display", () => {
  test("Homepage displays products with real prices", async ({ page }) => {
    await page.goto("/uz");
    await expect(page.locator("h1")).toContainText(/Ofis jihozlari/i);

    // Verify products on homepage have real price tags
    const priceElements = page.locator("article").filter({ hasText: /so'm/i });
    const count = await priceElements.count();
    expect(count).toBeGreaterThan(0);

    // Verify the first product card has a non-zero price
    const firstPriceText = await priceElements.first().innerText();
    expect(firstPriceText).toMatch(/[1-9]\d*([,\s.]\d{3})*\s*so'm/i);
  });

  test("Language switch on category page automatically redirects to canonical localized slug", async ({
    page,
  }) => {
    // 1. Visit Uzbek category
    await page.goto("/uz/category/magnit-va-marker-doskalari");
    await expect(page.locator("h1")).toContainText(/Magnit va marker/i);

    // 2. Click 'Русский' in Language Switcher
    const ruBtn = page.getByRole("button", { name: "Русский" });
    await expect(ruBtn).toBeVisible();
    await ruBtn.click();

    // 3. Verify it does NOT show 404 and redirected to Russian category slug
    await page.waitForURL("**/ru/category/magnitnye-i-markernye-doski");
    await expect(page.locator("h1")).toContainText(/Магнитные/i);
  });

  test("Robots.txt is accessible and disallows cart/checkout/filters", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("User-Agent: *");
    expect(body).toContain("/uz/cart");
    expect(body).toContain("/uz/checkout");
    expect(body).toContain("Sitemap: https://sora.uz/sitemap.xml");
  });

  test("Sitemap.xml contains core URLs, categories, and products", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect(xml).toContain("https://sora.uz/uz");
    expect(xml).toContain("https://sora.uz/ru");
    expect(xml).toContain("/category/");
    expect(xml).toContain("/products/");
  });

  test("Category page contains valid Canonical, Hreflang and Breadcrumb JSON-LD", async ({ page }) => {
    await page.goto("/uz/category/magnit-va-marker-doskalari");

    // Canonical link
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toContain("/uz/category/magnit-va-marker-doskalari");

    // Hreflang links
    const hreflangUz = await page.locator('link[hreflang="uz" i]').getAttribute("href");
    const hreflangRu = await page.locator('link[hreflang="ru" i]').getAttribute("href");
    expect(hreflangUz).toContain("/uz/category/magnit-va-marker-doskalari");
    expect(hreflangRu).toContain("/ru/category/magnitnye-i-markernye-doski");

    // BreadcrumbList JSON-LD
    const ldJson = await page.locator('script[type="application/ld+json"]').allInnerTexts();
    const hasBreadcrumb = ldJson.some((j) => j.includes("BreadcrumbList"));
    expect(hasBreadcrumb).toBe(true);
  });
});
