import { test, expect } from "@playwright/test";
import { computeProductDiff } from "@/lib/sync/diff-utils";
import { Product } from "@/lib/schemas/product";
import { FIXTURE_PRODUCTS } from "@/lib/api/fixtures";

test.describe("Smart Diff / Delta Revalidation Suite", () => {
  const baseProduct: Product = {
    ...FIXTURE_PRODUCTS[0],
    id: "TEST-PROD-001",
    price: {
      id: "TEST-PROD-001",
      stock: "InStock",
      quantity_remaining: 15,
      retail_price: 25000,
      dealer_price: 22000,
      wholesale_price: 20000,
      currency: "UZS",
      unit_uz: "dona",
      unit_ru: "шт",
    },
  };

  test("1. computeProductDiff detects zero changes when arrays are identical", () => {
    const cached = [baseProduct];
    const fresh = [{ ...baseProduct }];

    const diff = computeProductDiff(cached, fresh);
    expect(diff.hasChanges).toBe(false);
    expect(diff.summary.changedCount).toBe(0);
    expect(diff.added).toHaveLength(0);
    expect(diff.deleted).toHaveLength(0);
    expect(diff.modified).toHaveLength(0);
  });

  test("2. computeProductDiff detects price and stock modifications", () => {
    const cached = [baseProduct];
    const fresh = [
      {
        ...baseProduct,
        price: {
          ...baseProduct.price!,
          retail_price: 30000,
          quantity_remaining: 5,
        },
      },
    ];

    const diff = computeProductDiff(cached, fresh);
    expect(diff.hasChanges).toBe(true);
    expect(diff.priceChanged).toBe(true);
    expect(diff.summary.modifiedCount).toBe(1);
    expect(diff.modified[0].id).toBe("TEST-PROD-001");
    expect(
      diff.modified[0].changes.some((c) => c.includes("retail_price: 25000 -> 30000"))
    ).toBe(true);
    expect(
      diff.modified[0].changes.some((c) => c.includes("quantity: 15 -> 5"))
    ).toBe(true);
  });

  test("3. computeProductDiff detects newly added and deleted products", () => {
    const cached = [baseProduct];
    const newProduct: Product = {
      ...baseProduct,
      id: "TEST-PROD-002",
      uz: {
        ...baseProduct.uz,
        name_uz: "Yangi Mahsulot",
        slug_uz: "yangi-mahsulot",
      },
    };

    // Case: Product added
    const diffAdded = computeProductDiff(cached, [baseProduct, newProduct]);
    expect(diffAdded.hasChanges).toBe(true);
    expect(diffAdded.summary.addedCount).toBe(1);
    expect(diffAdded.added[0].id).toBe("TEST-PROD-002");

    // Case: Product deleted
    const diffDeleted = computeProductDiff([baseProduct, newProduct], [baseProduct]);
    expect(diffDeleted.hasChanges).toBe(true);
    expect(diffDeleted.summary.deletedCount).toBe(1);
    expect(diffDeleted.deleted[0].id).toBe("TEST-PROD-002");
  });

  test("4. /api/revalidate?mode=smart-diff endpoint returns valid JSON summary and protects with secret", async ({
    request,
  }) => {
    // 4.1. Rejects invalid secret
    const unauth = await request.get("/api/revalidate?secret=invalid_secret&mode=smart-diff");
    expect(unauth.status()).toBe(401);

    // 4.2. Accepts valid secret via GET
    const res = await request.get(
      "/api/revalidate?secret=sora_revalidate_secret_2026&mode=smart-diff"
    );
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.mode).toBe("smart-diff");
    expect(body.summary).toBeDefined();
    expect(typeof body.summary.totalCached).toBe("number");
    expect(typeof body.summary.changedCount).toBe("number");
  });

  test("5. /api/revalidate with tag=smart-diff works via POST as well", async ({
    request,
  }) => {
    const res = await request.post("/api/revalidate", {
      data: {
        secret: "sora_revalidate_secret_2026",
        mode: "smart-diff",
      },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.mode).toBe("smart-diff");
    expect(body.summary).toBeDefined();
  });

  test("6. Existing legacy tag revalidation remains 100% backwards-compatible", async ({
    request,
  }) => {
    const res = await request.get(
      "/api/revalidate?secret=sora_revalidate_secret_2026&tag=prices"
    );
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.revalidated).toBe(true);
    expect(body.tag).toBe("prices");
    expect(body.indexnow.dispatched).toBe(true);
  });
});
