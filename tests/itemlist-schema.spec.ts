import { test, expect } from "@playwright/test";

test.describe("Schema.org ItemList (Product Collections & Carousels)", () => {
  test("1. Category page contains valid ItemList Schema with localized products and positions", async ({
    page,
  }) => {
    await page.goto("/uz/category/ish-stoli-kalkulyatorlari");
    await page.waitForLoadState("domcontentloaded");

    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    let itemListSchema: any = null;

    for (const text of scripts) {
      try {
        const parsed = JSON.parse(text);
        if (parsed["@type"] === "ItemList") {
          itemListSchema = parsed;
          break;
        }
      } catch {
        // ignore
      }
    }

    expect(itemListSchema).not.toBeNull();
    expect(itemListSchema["@context"]).toBe("https://schema.org");
    expect(itemListSchema.name).toBeTruthy();
    expect(Array.isArray(itemListSchema.itemListElement)).toBe(true);
    expect(itemListSchema.itemListElement.length).toBeGreaterThan(0);
    expect(itemListSchema.itemListElement.length).toBeLessThanOrEqual(24);

    // Verify first element structure
    const firstItem = itemListSchema.itemListElement[0];
    expect(firstItem["@type"]).toBe("ListItem");
    expect(firstItem.position).toBe(1);
    expect(firstItem.url).toMatch(/^https:\/\/sora\.uz\/uz\/products\//);
    expect(firstItem.name).toBeTruthy();
    expect(firstItem.item["@type"]).toBe("Product");
    expect(firstItem.item.offers["@type"]).toBe("Offer");
    expect(firstItem.item.offers.priceCurrency).toBe("UZS");
  });

  test("2. Brand page contains valid ItemList Schema", async ({ page }) => {
    await page.goto("/uz/brand/deli");
    await page.waitForLoadState("domcontentloaded");

    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    let brandItemList: any = null;

    for (const text of scripts) {
      try {
        const parsed = JSON.parse(text);
        if (parsed["@type"] === "ItemList") {
          brandItemList = parsed;
          break;
        }
      } catch {
        // ignore
      }
    }

    expect(brandItemList).not.toBeNull();
    expect(brandItemList.name).toContain("DELI");
    expect(brandItemList.itemListElement.length).toBeGreaterThan(0);
    expect(brandItemList.itemListElement[0].position).toBe(1);
    expect(brandItemList.itemListElement[0].item["@type"]).toBe("Product");
  });

  test("3. Special offers page contains valid ItemList Schema", async ({ page }) => {
    await page.goto("/uz/catalog/popular");
    await page.waitForLoadState("domcontentloaded");

    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    let offerItemList: any = null;

    for (const text of scripts) {
      try {
        const parsed = JSON.parse(text);
        if (parsed["@type"] === "ItemList") {
          offerItemList = parsed;
          break;
        }
      } catch {
        // ignore
      }
    }

    expect(offerItemList).not.toBeNull();
    expect(offerItemList.itemListElement.length).toBeGreaterThan(0);
    expect(offerItemList.itemListElement[0].url).toContain("/products/");
    expect(offerItemList.itemListElement[0].item["@type"]).toBe("Product");
  });

  test("4. Multi-page pagination starts ItemList position from (page - 1) * 24 + 1", async ({
    page,
  }) => {
    await page.goto("/uz/category/ish-stoli-kalkulyatorlari?page=2");
    await page.waitForLoadState("domcontentloaded");

    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    let page2ItemList: any = null;

    for (const text of scripts) {
      try {
        const parsed = JSON.parse(text);
        if (parsed["@type"] === "ItemList") {
          page2ItemList = parsed;
          break;
        }
      } catch {
        // ignore
      }
    }

    if (page2ItemList && page2ItemList.itemListElement.length > 0) {
      expect(page2ItemList.itemListElement[0].position).toBe(25);
    }
  });
});
