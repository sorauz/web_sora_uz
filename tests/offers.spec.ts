import { test, expect } from "@playwright/test";
import { isOfferActive, getOfferBadge } from "../src/lib/utils/offer";

test.describe("1C Special Offers Unit Logic", () => {
  test("isOfferActive correctly validates date boundaries", () => {
    // 1. Current valid window
    const activeOffer = {
      id: "test-1",
      name: "Active Item",
      group_uz: "Aksiya",
      group_ru: "Акция",
      group_slug_uz: "aksiya",
      group_slug_ru: "aktsiya",
      Offer_start_time: "2026-01-01T00:00:00",
      Offer_end_time: "2026-12-31T23:59:59",
    };
    expect(isOfferActive(activeOffer)).toBe(true);

    // 2. Expired offer
    const expiredOffer = {
      ...activeOffer,
      Offer_start_time: "2024-01-01T00:00:00",
      Offer_end_time: "2024-12-31T23:59:59",
    };
    expect(isOfferActive(expiredOffer)).toBe(false);

    // 3. Future offer not started yet
    const futureOffer = {
      ...activeOffer,
      Offer_start_time: "2030-01-01T00:00:00",
      Offer_end_time: "2030-12-31T23:59:59",
    };
    expect(isOfferActive(futureOffer)).toBe(false);

    // 4. Missing dates default to active
    const openOffer = {
      id: "test-2",
      name: "Open Item",
      group_uz: "Aksiya",
      group_ru: "Акция",
      group_slug_uz: "aksiya",
      group_slug_ru: "aktsiya",
    };
    expect(isOfferActive(openOffer)).toBe(true);
  });

  test("getOfferBadge returns accurate bilingual badges", () => {
    expect(getOfferBadge("low_price_guarantee", "uz").text).toBe("Eng arzon narx");
    expect(getOfferBadge("low_price_guarantee", "ru").text).toBe("Лучшая цена");
    expect(getOfferBadge("promotions", "uz").text).toBe("Aksiya");
    expect(getOfferBadge("promotions", "ru").text).toBe("Скидка");
    expect(getOfferBadge("popular", "uz").text).toBe("Xit");
    expect(getOfferBadge("popular", "ru").text).toBe("Хит");
    expect(getOfferBadge("new_products", "uz").text).toBe("Yangi");
    expect(getOfferBadge("new_products", "ru").text).toBe("Новинка");
  });
});

test.describe("Offers UI & Route Verification", () => {
  test("Homepage renders offer sections and navigation links", async ({ page }) => {
    await page.goto("/uz");

    // Check PromoNav has offer links
    const promoNav = page.locator("nav");
    await expect(promoNav.first()).toBeVisible();

    // Check that offers links exist in DOM
    const offersLink = page.locator('a[href*="/offers"], a[href*="offer="]').first();
    await expect(offersLink).toBeVisible();
  });

  test("Offers Hub page (/uz/offers) renders with tab navigation", async ({ page }) => {
    await page.goto("/uz/offers");

    // Header and title
    await expect(page.locator("h1")).toBeVisible();

    // Tabs should be visible
    const tabs = page.locator('a[href*="/offers"]');
    expect(await tabs.count()).toBeGreaterThan(0);
  });

  test("Catalog page handles offer search param (?offer=promotions)", async ({ page }) => {
    await page.goto("/uz/catalog?offer=promotions");

    // Filter banner or title should be displayed
    await expect(page.locator("h1")).toBeVisible();
  });
});
