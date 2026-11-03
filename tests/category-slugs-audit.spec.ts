import { test, expect } from "@playwright/test";

test.describe("Category Slugs & Aliases Verification", () => {
  test("1. Direct Russian category /ru/category/bumazhnaya-produktsiya loads successfully (200 OK)", async ({
    page,
  }) => {
    const res = await page.goto("/ru/category/bumazhnaya-produktsiya");
    expect(res?.status()).toBe(200);

    // Verify Title and Heading
    await expect(page).toHaveTitle(/Бумажная продукция/);
    const heading = page.locator("h1");
    await expect(heading).toContainText("Бумажная продукция");

    // Verify breadcrumbs
    const breadcrumb = page.locator("nav[aria-label='Breadcrumb']");
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText("Бумажная продукция");
  });

  test("2. Legacy / alternative transliteration /ru/category/bumazhnaya-produkciya auto-redirects to canonical /ru/category/bumazhnaya-produktsiya", async ({
    page,
  }) => {
    // Should NOT show 404 (notFound)
    await page.goto("/ru/category/bumazhnaya-produkciya");
    expect(page.url()).toContain("/ru/category/bumazhnaya-produktsiya");

    // Verify page rendered properly
    await expect(page.locator("h1")).toContainText("Бумажная продукция");
  });

  test("3. Uzbek category /uz/category/qogoz-mahsulotlari loads successfully (200 OK)", async ({
    page,
  }) => {
    const res = await page.goto("/uz/category/qogoz-mahsulotlari");
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/Qogʻoz mahsulotlari|Qog'oz mahsulotlari/);
    await expect(page.locator("h1")).toContainText(/Qogʻoz mahsulotlari|Qog'oz mahsulotlari/);
  });

  test("4. Cross-language URL switch: visiting /ru with Uzbek slug redirects to Russian canonical slug", async ({
    page,
  }) => {
    await page.goto("/ru/category/qogoz-mahsulotlari");
    await page.waitForURL("**/ru/category/bumazhnaya-produktsiya");
    expect(page.url()).toContain("/ru/category/bumazhnaya-produktsiya");
  });

  test("5. Homepage Top Categories in both UZ and RU link to 100% valid canonical slugs", async ({
    page,
  }) => {
    // Test UZ homepage
    await page.goto("/uz");
    const uzSection = page.locator("section", { hasText: "Ommabop kategoriyalar" });
    const uzLinks = await uzSection.locator("a[href*='/category/']").evaluateAll((anchors) =>
      anchors.map((a) => a.getAttribute("href"))
    );
    expect(uzLinks.length).toBe(8);
    for (const link of uzLinks) {
      expect(link).not.toContain("bumazhnaya-produkciya");
      expect(link).toMatch(/^\/(uz\/)?category\/[a-z0-9\-]+$/);
    }

    // Test RU homepage
    await page.goto("/ru");
    const ruSection = page.locator("section", { hasText: "Популярные категории" });
    const ruLinks = await ruSection.locator("a[href*='/category/']").evaluateAll((anchors) =>
      anchors.map((a) => a.getAttribute("href"))
    );
    expect(ruLinks.length).toBe(8);
    // Explicitly verify the paper products link
    expect(ruLinks[0]).toContain("/ru/category/bumazhnaya-produktsiya");
    for (const link of ruLinks) {
      expect(link).not.toContain("bumazhnaya-produkciya");
      expect(link).toMatch(/^\/ru\/category\/[a-z0-9\-]+$/);
    }
  });
});
