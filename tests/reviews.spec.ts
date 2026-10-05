import { test, expect } from "@playwright/test";
import { calculateReviewStats } from "../src/lib/utils/review";
import { Review } from "../src/lib/schemas/review";

test.describe("1C ERP Review API & PDP Reviews Integration", () => {
  test("1. calculateReviewStats accurately calculates ratings, distributions and percentages", () => {
    const mockReviews: Review[] = [
      {
        productId: "guid-1",
        productName: "Test Product",
        name_author: "Ali",
        ratingValue: 5,
        bestRating: 5,
        reviewBody: "A'lo darajada",
        time_of_comment: "2026-10-01T10:00:00",
        datePublished: "2026-10-01T10:00:00",
        permission_to_publish: true,
        pic_url: "",
      },
      {
        productId: "guid-1",
        productName: "Test Product",
        name_author: "Vali",
        ratingValue: 4,
        bestRating: 5,
        reviewBody: "Yaxshi mahsulot",
        time_of_comment: "2026-10-02T10:00:00",
        datePublished: "2026-10-02T10:00:00",
        permission_to_publish: true,
        pic_url: "",
      },
      {
        productId: "guid-1",
        productName: "Test Product",
        name_author: "Sami (moderatsiyadan o'tmagan)",
        ratingValue: 1,
        bestRating: 5,
        reviewBody: "Spam",
        time_of_comment: "2026-10-03T10:00:00",
        datePublished: "2026-10-03T10:00:00",
        permission_to_publish: false, // Should be ignored
        pic_url: "",
      },
    ];

    const stats = calculateReviewStats(mockReviews);
    expect(stats.reviewCount).toBe(2);
    // (5 + 4) / 2 = 4.5
    expect(stats.averageRating).toBe(4.5);
    expect(stats.distribution[5]).toBe(1);
    expect(stats.distribution[4]).toBe(1);
    expect(stats.distribution[1]).toBe(0);
    expect(stats.percentages[5]).toBe(50);
    expect(stats.percentages[4]).toBe(50);
  });

  test("2. Diagnostic API /api/1c/test includes Review endpoint and connects successfully", async ({
    request,
  }) => {
    const res = await request.get("/api/1c/test");
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    const reviewEp = json.endpoints.find((ep: { endpoint: string }) =>
      ep.endpoint.includes("/review")
    );
    expect(reviewEp).toBeTruthy();
    expect(reviewEp.isSuccess).toBeTruthy();
    expect(reviewEp.status).toBe(200);
  });

  test("3. PDP renders live 1C reviews for product with reviews", async ({
    page,
  }) => {
    // Navigate to the product that has live 1C review (Deli 8014 cutter)
    await page.goto(
      "/uz/products/deli-e-8014-a4-formatli-qolda-ishlaydigan-qogoz-kesish-mashinasi"
    );

    // Click on Sharhlar tab
    await page.getByRole("button", { name: /sharhlar/i }).click();

    // Check author and comment text from 1C
    await expect(page.getByText("Azizbek R.")).toBeVisible();
    await expect(
      page.getByText(/Mahsulot juda yaxshi, faqat yetkazib berish vaqti kechga surildi/i)
    ).toBeVisible();

    // Verify JSON-LD Schema includes aggregateRating and review item
    const jsonLdScripts = await page
      .locator('script[type="application/ld+json"]')
      .all();
    const allLdTexts = await Promise.all(
      jsonLdScripts.map((s) => s.textContent())
    );
    const productJson = allLdTexts.find((t) =>
      t?.includes('"@type":"Product"')
    );
    expect(productJson).toBeTruthy();
    expect(productJson).toContain('"aggregateRating"');
    expect(productJson).toContain('"@type":"Review"');
    expect(productJson).toContain("Azizbek R.");
  });
});
