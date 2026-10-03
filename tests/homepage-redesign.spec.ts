import { test, expect } from "@playwright/test";

test.describe("Homepage Redesign & Special Offers Layout", () => {
  test("1. Ommabop kategoriyalar: Exactly 4 categories visible with shuffle ability and localization", async ({
    page,
  }) => {
    await page.goto("/uz");

    // Check section title
    const section = page.locator("section", { has: page.locator("h2", { hasText: "Ommabop kategoriyalar" }) });
    await expect(section).toBeVisible();

    // Verify exactly 4 category cards are rendered in the random categories container
    const categoryCards = section.locator("a[href*='/category/']");
    const count = await categoryCards.count();
    expect(count).toBe(4);

    // Verify shuffle button exists
    const shuffleBtn = section.locator("button[aria-label='Boshqa toifalar']");
    await expect(shuffleBtn).toBeVisible();

    // Test in Russian locale
    await page.goto("/ru");
    const ruSection = page.locator("section", { has: page.locator("h2", { hasText: "Популярные категории" }) });
    await expect(ruSection).toBeVisible();
    const ruCards = ruSection.locator("a[href*='/category/']");
    expect(await ruCards.count()).toBe(4);
  });

  test("2. 4 Offer Sections: 5 columns layout with up to 15 items per section", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("/uz");

    const offerSections = [
      { id: "promotions", title: "Chegirmalar va maxsus takliflar" },
      { id: "low-price", title: "Kafolatlangan eng arzon narx" },
      { id: "popular", title: "Top mahsulotlar" },
      { id: "new-products", title: "Yangi kelgan mahsulotlar" },
    ];

    for (const section of offerSections) {
      const sectionEl = page.locator(`section#${section.id}`);
      if (await sectionEl.isVisible()) {
        // Check grid has lg:grid-cols-5
        const grid = sectionEl.locator(".grid");
        const className = await grid.getAttribute("class");
        expect(className).toContain("lg:grid-cols-5");

        // Check products count is at most 15
        const cards = sectionEl.locator("article");
        const cardCount = await cards.count();
        expect(cardCount).toBeGreaterThan(0);
        expect(cardCount).toBeLessThanOrEqual(15);
      }
    }
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
});
