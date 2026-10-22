import { test, expect } from "@playwright/test";

test.describe("Homepage Redesign & Special Offers Layout", () => {
  test("0. Dynamic HeroSlider: Renders 4 interactive slides, indicators, arrows, and localized content (UZ & RU)", async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/uz");

    const carousel = page.locator("section[aria-roledescription='carousel']");
    await expect(carousel).toBeVisible();

    // Verify 4 slide indicator tabs exist
    const tabs = carousel.locator("button[role='tab']");
    await expect(tabs).toHaveCount(4);

    // Slide 1 (Sale) is active initially
    await expect(page.locator("h1")).toContainText(
      "Kanselyariya va Ofis Jihozlari Ulgurji Narxlarda"
    );
    await expect(carousel).toContainText("10 000+ tovar mavjud");

    // Click indicator for Slide 2 (B2B)
    await tabs.nth(1).click();
    await expect(carousel).toContainText(
      "Ofisingiz Uchun Barcha Anjomlar — 24 Soatda Yetkazamiz"
    );
    await expect(carousel).toContainText("100% Rasmiy hujjatlar va Didox");

    // Click next arrow -> Slide 3 (Deli)
    await carousel.locator("button[aria-label='Keyingi slayd']").click();
    await expect(carousel).toContainText(
      "Deli: Perpletka, Laminator va Professional Jihozlar"
    );

    // Click next arrow -> Slide 4 (Delivery)
    await carousel.locator("button[aria-label='Keyingi slayd']").click();
    await expect(carousel).toContainText(
      "Toshkent Bo‘ylab 24 Soatda, Viloyatlarga 1–3 Kunda"
    );

    // Verify all 4 local WebP banner assets return 200 OK
    for (const img of [
      "/banners/hero-slide-sale.webp",
      "/banners/hero-slide-b2b.webp",
      "/banners/hero-slide-deli.webp",
      "/banners/hero-slide-delivery.webp",
    ]) {
      const res = await request.get(img);
      expect(res.status()).toBe(200);
    }

    // Check Russian localization on /ru
    await page.goto("/ru");
    await expect(page.locator("h1")).toContainText(
      "Канцелярия и Товары для Офиса по Оптовым Ценам"
    );
  });

  test("1. Ommabop kategoriyalar: Top 8 categories rendered with real product photos and localized links", async ({
    page,
  }) => {
    await page.goto("/uz");

    // Check section title
    const section = page.locator("section", { has: page.locator("h2", { hasText: "Ommabop kategoriyalar" }) });
    await expect(section).toBeVisible();

    // Verify all 8 visual category cards are rendered
    const categoryCards = section.locator("a[href*='/category/']");
    const count = await categoryCards.count();
    expect(count).toBe(8);

    // Verify first card is Qog'oz mahsulotlari with real WebP image
    const firstCard = categoryCards.first();
    await expect(firstCard).toContainText("Qog‘oz mahsulotlari");
    const firstImg = firstCard.locator("img");
    await expect(firstImg).toBeVisible();
    const imgSrc = await firstImg.getAttribute("src");
    expect(imgSrc).toContain("qogoz.webp");

    // Verify link href
    await expect(firstCard).toHaveAttribute("href", "/uz/category/qogoz-mahsulotlari");

    // Test in Russian locale
    await page.goto("/ru");
    const ruSection = page.locator("section", { has: page.locator("h2", { hasText: "Популярные категории" }) });
    await expect(ruSection).toBeVisible();
    const ruCards = ruSection.locator("a[href*='/category/']");
    expect(await ruCards.count()).toBe(8);
    const ruFirstCard = ruCards.first();
    await expect(ruFirstCard).toContainText("Бумажная продукция");
    await expect(ruFirstCard).toHaveAttribute("href", "/ru/category/bumazhnaya-produkciya");
  });

  test("2. Featured Products Tabs: 4 interactive tabs with 5-column layout and dynamic links", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/uz");

    const featuredSection = page.locator("section#featured-tabs");
    await expect(featuredSection).toBeVisible();

    // Section title
    await expect(featuredSection.locator("h2")).toContainText("Maxsus takliflar");

    // All 4 tabs must be present and visible
    const promoTab = page.locator("#tab-promotions");
    const popularTab = page.locator("#tab-popular");
    const newTab = page.locator("#tab-new_products");
    const lowPriceTab = page.locator("#tab-low_price");

    await expect(promoTab).toBeVisible();
    await expect(popularTab).toBeVisible();
    await expect(newTab).toBeVisible();
    await expect(lowPriceTab).toBeVisible();

    // Initial state: promotions tab is active
    await expect(promoTab).toHaveAttribute("aria-selected", "true");
    const viewAllLink = featuredSection.locator("a[href*='/catalog/']").first();
    await expect(viewAllLink).toHaveAttribute("href", "/uz/catalog/promotions");

    // Grid has 5 columns on desktop (lg:grid-cols-5) and up to 10 product cards
    const grid = featuredSection.locator(".grid");
    await expect(grid).toBeVisible();
    const gridClass = await grid.getAttribute("class");
    expect(gridClass).toContain("lg:grid-cols-5");

    const cards = featuredSection.locator("article");
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);
    expect(cardCount).toBeLessThanOrEqual(10);

    // Switch to Popular tab
    await popularTab.click();
    await expect(popularTab).toHaveAttribute("aria-selected", "true");
    await expect(promoTab).toHaveAttribute("aria-selected", "false");
    await expect(viewAllLink).toHaveAttribute("href", "/uz/catalog/popular");

    // Switch to Low Price tab
    await lowPriceTab.click();
    await expect(lowPriceTab).toHaveAttribute("aria-selected", "true");
    await expect(viewAllLink).toHaveAttribute("href", "/uz/catalog/low_price_guarantee");

    // Switch to New Arrivals tab
    await newTab.click();
    await expect(newTab).toHaveAttribute("aria-selected", "true");
    await expect(viewAllLink).toHaveAttribute("href", "/uz/catalog/new_products");
  });

  test("3. Rasmiy brendlar: 3-row rotating marquee with alternating directions", async ({
    page,
  }) => {
    await page.goto("/uz");

    // Title
    const brandsTitle = page.locator("h2", { hasText: "Rasmiy brendlar" });
    await expect(brandsTitle).toBeVisible();

    // Marquee rows
    const row1 = page.locator(".animate-marquee-left").first();
    const row2 = page.locator(".animate-marquee-right");
    const row3 = page.locator(".animate-marquee-left-fast");

    await expect(row1).toBeVisible();
    await expect(row2).toBeVisible();
    await expect(row3).toBeVisible();

    // Check brand links inside marquee
    const brandLinks = page.locator("a[href*='/brand/']");
    const brandCount = await brandLinks.count();
    expect(brandCount).toBeGreaterThanOrEqual(10);
  });

  test("4. 'Nega aynan Sora.uz?' features section remains intact", async ({ page }) => {
    await page.goto("/uz");

    const featuresTitle = page.locator("h2", { hasText: "Nega aynan Sora.uz?" });
    await expect(featuresTitle).toBeVisible();

    // Check 4 features
    await expect(page.locator("text=Tezkor yetkazib berish")).toBeVisible();
    await expect(page.locator("text=100% Asl mahsulotlar")).toBeVisible();
    await expect(page.locator("text=Qulay to'lov turlari")).toBeVisible();
    await expect(page.locator("text=B2B va B2C yechimlar")).toBeVisible();
  });

  test("5. Title Icon (Favicon) is set to for_web_logo_icon.ico", async ({ page, request }) => {
    await page.goto("/uz");

    // Check that link tag with for_web_logo_icon.ico exists in head
    const iconLink = page.locator("link[href*='for_web_logo_icon.ico']").first();
    await expect(iconLink).toBeAttached();

    // Verify /for_web_logo_icon.ico returns 200 OK
    const iconRes = await request.get("/for_web_logo_icon.ico");
    expect(iconRes.status()).toBe(200);

    // Verify /favicon.ico also returns 200 OK
    const faviconRes = await request.get("/favicon.ico");
    expect(faviconRes.status()).toBe(200);
  });
});
