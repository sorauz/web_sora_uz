import { test, expect } from "@playwright/test";
import { normalizeIndexNowUrls, DEFAULT_INDEXNOW_KEY } from "@/lib/seo/indexnow";

test.describe("IndexNow Protocol Integration (Instant Search Engine Indexing)", () => {
  test("1. Public key verification file /{key}.txt is accessible and returns the exact key", async ({
    request,
  }) => {
    const key = DEFAULT_INDEXNOW_KEY;
    const response = await request.get(`/${key}.txt`);
    expect(response.status()).toBe(200);

    const body = (await response.text()).trim();
    expect(body).toBe(key);
  });

  test("2. normalizeIndexNowUrls helper converts relative paths and deduplicates URLs", () => {
    const rawUrls = [
      "/uz/products/deli-3871",
      "https://sora.uz/uz/products/deli-3871", // duplicate
      "/ru/products/deli-3871",
      "https://sora.uz/category/kalkulyatorlar",
    ];

    const normalized = normalizeIndexNowUrls(rawUrls, "sora.uz");
    expect(normalized).toHaveLength(3);
    expect(normalized).toContain("https://sora.uz/uz/products/deli-3871");
    expect(normalized).toContain("https://sora.uz/ru/products/deli-3871");
    expect(normalized).toContain("https://sora.uz/category/kalkulyatorlar");
  });

  test("3. /api/indexnow endpoint rejects requests without valid secret", async ({
    request,
  }) => {
    const response = await request.post("/api/indexnow", {
      data: {
        secret: "wrong_secret",
        urls: ["https://sora.uz/uz"],
      },
    });
    expect(response.status()).toBe(401);
  });

  test("4. /api/indexnow endpoint status check works with valid secret", async ({
    request,
  }) => {
    const response = await request.get(
      "/api/indexnow?secret=sora_revalidate_secret_2026"
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.status).toContain("IndexNow endpoint active");
    expect(data.keyConfigured).toBe(true);
  });

  test("5. /api/revalidate automatically dispatches URLs to IndexNow on tag and path updates", async ({
    request,
  }) => {
    // Test with path revalidation
    const resPath = await request.get(
      "/api/revalidate?secret=sora_revalidate_secret_2026&path=/products/deli-0316"
    );
    expect(resPath.status()).toBe(200);
    const dataPath = await resPath.json();
    expect(dataPath.revalidated).toBe(true);
    expect(dataPath.indexnow.dispatched).toBe(true);
    expect(dataPath.indexnow.urlCount).toBe(2); // uz and ru paths

    // Test with products tag revalidation
    const resTag = await request.post("/api/revalidate", {
      data: {
        secret: "sora_revalidate_secret_2026",
        tag: "products",
      },
    });
    expect(resTag.status()).toBe(200);
    const dataTag = await resTag.json();
    expect(dataTag.revalidated).toBe(true);
    expect(dataTag.indexnow.dispatched).toBe(true);
    expect(dataTag.indexnow.urlCount).toBe(4); // uz, ru, uz/catalog, ru/catalog
  });
});
