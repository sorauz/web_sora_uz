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

test.describe("Offers UI & Static Route Verification", () => {
  test("Homepage renders offer sections and navigation links to static routes", async ({ page }) => {
    await page.goto("/uz");

    // Check PromoNav has offer links
    const promoNav = page.locator("nav");
    await expect(promoNav.first()).toBeVisible();

    // Check that static offer links exist in DOM
    const offersLink = page.locator('a[href*="/catalog/new_products"], a[href*="/catalog/promotions"]').first();
    await expect(offersLink).toBeVisible();
  });

  test("Offers Hub page (/uz/offers) renders with tab navigation", async ({ page }) => {
    await page.goto("/uz/offers");

    await expect(page.locator("h1")).toBeVisible();
    const tabs = page.locator('a[href*="/offers"]');
    expect(await tabs.count()).toBeGreaterThan(0);
  });

  test("All 4 Static Offer Landing Pages render with 200 OK and canonical links", async ({ page }) => {
    const staticEndpoints = [
      { path: "/uz/catalog/new_products", titlePart: "Yangi" },
      { path: "/uz/catalog/low_price_guarantee", titlePart: "Eng Arzon" },
      { path: "/uz/catalog/popular", titlePart: "Ommabop" },
      { path: "/uz/catalog/promotions", titlePart: "Aksiyalar" },
    ];

    for (const item of staticEndpoints) {
      const response = await page.goto(item.path);
      expect(response?.status()).toBe(200);

      // Check h1 text
      const h1 = page.locator("h1");
      await expect(h1).toBeVisible();
      const text = await h1.textContent();
      expect(text?.toLowerCase()).toContain(item.titlePart.toLowerCase());

      // Check canonical link in head
      const canonical = page.locator('link[rel="canonical"]');
      const href = await canonical.getAttribute("href");
      expect(href).toContain(item.path.replace("/uz", ""));
    }
  });

  test("Catalog query param redirect (?offer=new -> /catalog/new_products)", async ({ page }) => {
    await page.goto("/uz/catalog?offer=new");

    // Must be redirected to static clean URL
    expect(page.url()).toContain("/catalog/new_products");
    await expect(page.locator("h1")).toBeVisible();
  });
});
