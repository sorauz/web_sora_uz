import { test, expect } from "@playwright/test";

interface ItemListSchemaElement {
  "@type"?: string;
  position?: number;
  name?: string;
  url?: string;
  item?: {
    "@type"?: string;
    offers?: {
      "@type"?: string;
      price?: number;
      priceCurrency?: string;
    };
  };
}

interface ItemListSchema {
  "@context"?: string;
  "@type"?: string;
  name?: string;
  itemListElement?: ItemListSchemaElement[];
}

test.describe("Schema.org ItemList (Product Collections & Carousels)", () => {
  test("1. Category page contains valid ItemList Schema with localized products and positions", async ({
    page,
  }) => {
    await page.goto("/uz/category/ish-stoli-kalkulyatorlari");
    await page.waitForLoadState("domcontentloaded");

    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    let itemListSchema: ItemListSchema | null = null;

    for (const text of scripts) {
      try {
        const parsed = JSON.parse(text) as ItemListSchema;
        if (parsed["@type"] === "ItemList") {
          itemListSchema = parsed;
          break;
        }
      } catch {
        // ignore
      }
    }

    expect(itemListSchema).not.toBeNull();
    expect(itemListSchema?.["@context"]).toBe("https://schema.org");
    expect(itemListSchema?.name).toBeTruthy();
    expect(Array.isArray(itemListSchema?.itemListElement)).toBe(true);
    const elements = itemListSchema?.itemListElement ?? [];
    expect(elements.length).toBeGreaterThan(0);
    expect(elements.length).toBeLessThanOrEqual(24);

    // Verify first element structure
    const firstItem = elements[0];
    expect(firstItem["@type"]).toBe("ListItem");
    expect(firstItem.position).toBe(1);
    expect(firstItem.url).toMatch(/^https:\/\/sora\.uz\/uz\/products\//);
    expect(firstItem.name).toBeTruthy();
    if (firstItem.item) {
      expect(firstItem.item["@type"]).toBe("Product");
      expect(firstItem.item.offers?.["@type"]).toBe("Offer");
      expect(firstItem.item.offers?.priceCurrency).toBe("UZS");
      expect(firstItem.item.offers?.price).toBeGreaterThan(0);
    }
  });

  test("2. Brand page contains valid ItemList Schema", async ({ page }) => {
    await page.goto("/uz/brand/deli");
    await page.waitForLoadState("domcontentloaded");

    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    let brandItemList: ItemListSchema | null = null;

    for (const text of scripts) {
      try {
        const parsed = JSON.parse(text) as ItemListSchema;
        if (parsed["@type"] === "ItemList") {
          brandItemList = parsed;
          break;
        }
      } catch {
        // ignore
      }
    }

    expect(brandItemList).not.toBeNull();
    expect(brandItemList?.name).toContain("DELI");
    const elements = brandItemList?.itemListElement ?? [];
    expect(elements.length).toBeGreaterThan(0);
    expect(elements[0].position).toBe(1);
    if (elements[0].item) {
      expect(elements[0].item["@type"]).toBe("Product");
    }
  });

  test("3. Special offers page contains valid ItemList Schema", async ({ page }) => {
    await page.goto("/uz/catalog/popular");
    await page.waitForLoadState("domcontentloaded");

    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    let offerItemList: ItemListSchema | null = null;

    for (const text of scripts) {
      try {
        const parsed = JSON.parse(text) as ItemListSchema;
        if (parsed["@type"] === "ItemList") {
          offerItemList = parsed;
          break;
        }
      } catch {
        // ignore
      }
    }

    expect(offerItemList).not.toBeNull();
    const elements = offerItemList?.itemListElement ?? [];
    expect(elements.length).toBeGreaterThan(0);
    expect(elements[0].url).toContain("/products/");
    if (elements[0].item) {
      expect(elements[0].item["@type"]).toBe("Product");
    }
  });

  test("4. Multi-page pagination starts ItemList position from (page - 1) * 24 + 1", async ({
    page,
  }) => {
    await page.goto("/uz/category/ish-stoli-kalkulyatorlari?page=2");
    await page.waitForLoadState("domcontentloaded");

    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    let page2ItemList: ItemListSchema | null = null;

    for (const text of scripts) {
      try {
        const parsed = JSON.parse(text) as ItemListSchema;
        if (parsed["@type"] === "ItemList") {
          page2ItemList = parsed;
          break;
        }
      } catch {
        // ignore
      }
    }

    const elements = page2ItemList?.itemListElement ?? [];
    if (elements.length > 0) {
      expect(elements[0].position).toBe(25);
    }
  });

  test("5. No ItemList emits an Offer without positive price across category, brand, and offers pages", async ({
    page,
  }) => {
    const urls = [
      "/uz/category/ilmiy-kalkulyatorlar",
      "/uz/category/ish-stoli-kalkulyatorlari",
      "/uz/brand/deli",
      "/uz/catalog/popular",
    ];

    for (const url of urls) {
      await page.goto(url);
      await page.waitForLoadState("domcontentloaded");

      const scripts = await page
        .locator('script[type="application/ld+json"]')
        .allTextContents();

      for (const text of scripts) {
        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(text);
        } catch {
          continue;
        }
        if (parsed["@type"] !== "ItemList") continue;
        const elements = parsed.itemListElement as Array<{
          position?: number;
          name?: string;
          url?: string;
          item?: {
            "@type"?: string;
            offers?: {
              "@type"?: string;
              price?: number;
              priceCurrency?: string;
            };
          };
        }>;
        for (const el of elements) {
          expect(el.position).toBeGreaterThan(0);
          expect(el.name).toBeTruthy();
          expect(el.url).toMatch(/^https:\/\/sora\.uz\//);
          if (el.item) {
            expect(el.item["@type"]).toBe("Product");
            expect(el.item.offers).toBeDefined();
            expect(typeof el.item.offers?.price).toBe("number");
            expect(el.item.offers?.price).toBeGreaterThan(0);
            expect(el.item.offers?.priceCurrency).toBe("UZS");
          }
        }
      }
    }
  });
});
