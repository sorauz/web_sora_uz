import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

function resolveTestAuditKey(): string {
  if (process.env.AUDIT_ACCESS_KEY) return process.env.AUDIT_ACCESS_KEY;
  if (process.env.REVALIDATION_SECRET) return process.env.REVALIDATION_SECRET;

  for (const filename of [".env.local", ".env"]) {
    const filePath = path.join(process.cwd(), filename);
    if (!fs.existsSync(filePath)) continue;
    const raw = fs.readFileSync(filePath, "utf8");
    for (const keyName of ["AUDIT_ACCESS_KEY", "REVALIDATION_SECRET"]) {
      const match = raw.match(new RegExp(`^${keyName}=(.+)$`, "m"));
      if (match?.[1]) {
        return match[1].trim().replace(/^["']|["']$/g, "");
      }
    }
  }

  return "sora_audit_2026";
}

test.describe("Internal Catalog & Google Merchant Audit Panel", () => {
  test("1. Unauthenticated access shows login gate, blocks SEO indexing, and leaks zero product data", async ({
    page,
    request,
  }) => {
    const pageRes = await page.goto("/uz/internal-audit");
    expect(pageRes?.status()).toBe(200);

    // X-Robots-Tag header from next.config.ts
    const headers = pageRes?.headers() || {};
    expect(headers["x-robots-tag"]).toContain("noindex");
    expect(headers["x-robots-tag"]).toContain("nofollow");

    // HTML <meta name="robots"> from generateMetadata
    const robotsMeta = await page
      .locator('meta[name="robots"]')
      .getAttribute("content");
    expect(robotsMeta).toContain("noindex");
    expect(robotsMeta).toContain("nofollow");

    // Login form visible, no dashboard table or 1C product rows leaked
    await expect(
      page.getByRole("heading", { name: /Ichki Katalog va Merchant Auditi/i }),
    ).toBeVisible();
    await expect(page.locator("#audit-password")).toBeVisible();
    await expect(page.locator("table")).toHaveCount(0);

    const html = await page.content();
    expect(html).not.toContain("1C LIVE");
    expect(html).not.toContain("Chakana_Narx");

    // Export and Sync APIs reject unauthenticated requests
    const exportRes = await request.get("/api/internal-audit/export");
    expect(exportRes.status()).toBe(401);
    expect(exportRes.headers()["x-robots-tag"]).toContain("noindex");

    const syncRes = await request.post("/api/internal-audit/sync", {
      data: { tag: "offers" },
    });
    expect(syncRes.status()).toBe(401);
    expect(syncRes.headers()["x-robots-tag"]).toContain("noindex");
  });

  test("2. robots.txt disallows internal-audit pages and API endpoints", async ({
    request,
  }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();

    expect(body).toContain("Disallow: /uz/internal-audit");
    expect(body).toContain("Disallow: /ru/internal-audit");
    expect(body).toContain("Disallow: /api/internal-audit/");
  });

  test("3. Wrong password is rejected and valid password unlocks live dashboard, filtering, and BOM CSV export", async ({
    page,
  }) => {
    await page.goto("/uz/internal-audit");

    // Invalid key attempt
    await page.locator("#audit-password").fill("wrong_invalid_key_123");
    await page.getByRole("button", { name: /Tizimga kirish/i }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: /Kirish kaliti/i }),
    ).toBeVisible();

    // Valid key attempt
    const validKey = resolveTestAuditKey();
    await page.locator("#audit-password").fill(validKey);
    await page.getByRole("button", { name: /Tizimga kirish/i }).click();

    // Dashboard loads live 1C audit
    await expect(
      page.getByRole("heading", {
        name: /1C Katalog va Google Merchant Auditi/i,
      }),
    ).toBeVisible({ timeout: 20000 });
    await expect(page.locator("table tbody tr").first()).toBeVisible();

    // KPI cards & filter interaction
    const merchantReadyCard = page.getByRole("button", {
      name: /Merchantga tayyor/i,
    });
    await expect(merchantReadyCard).toBeVisible();

    const noPriceCard = page.getByRole("button", { name: /Narxi 0 so‘m/i });
    await noPriceCard.click();

    // Export link reflects active filter and returns 200 CSV with UTF-8 BOM
    const exportLink = page.getByRole("link", {
      name: /Excel \(CSV\) yuklab olish/i,
    });
    const exportHref = await exportLink.getAttribute("href");
    expect(exportHref).toContain("/api/internal-audit/export");
    expect(exportHref).toContain("issue=no_price");

    const csvRes = await page.request.get(exportHref!);
    expect(csvRes.status()).toBe(200);
    expect(csvRes.headers()["content-type"]).toContain("text/csv");
    expect(csvRes.headers()["x-robots-tag"]).toContain("noindex");

    const csvBuf = await csvRes.body();
    // UTF-8 BOM (EF BB BF)
    expect(csvBuf[0]).toBe(0xef);
    expect(csvBuf[1]).toBe(0xbb);
    expect(csvBuf[2]).toBe(0xbf);

    const csvText = csvBuf.toString("utf8");
    expect(csvText).toContain('"1C_ID","Artikul_SKU","Mahsulot_Nomi_UZ"');

    // Row-level single product sync triggers /api/internal-audit/sync and shows notice
    const firstRowSyncBtn = page
      .locator("table tbody tr")
      .first()
      .getByRole("button", { name: /Sinxron/i });
    await firstRowSyncBtn.click();
    await expect(page.getByRole("status")).toBeVisible({ timeout: 15000 });

    // Whitelist rejects disallowed tags with 400
    const badSyncRes = await page.request.post("/api/internal-audit/sync", {
      data: { tag: "arbitrary_disallowed_tag" },
    });
    expect(badSyncRes.status()).toBe(400);

    // Switch to 1C Sinxronizatsiya tab
    await page
      .getByRole("button", { name: /1C Sinxronizatsiya va Kesh/i })
      .click();
    await expect(
      page.getByRole("heading", { name: /A\. Aqlli va Tejamkor Rejimlar/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /B\. Aniq Yo‘nalishli Kesh Tozalash/i,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /C\. Favqulodda Global Kesh/i }),
    ).toBeVisible();

    // Global flush requires confirmation first
    await page
      .getByRole("button", { name: /Butun sayt \+ Feedlarni yangilash/i })
      .click();
    await expect(
      page.getByRole("button", { name: /Ha, to‘liq yangilansin/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /Bekor qilish/i }).click();

    // Execute targeted offers sync & verify result card + secret never leaked
    await page.getByRole("button", { name: /Aksiyalar va vitrinalar/i }).click();
    await expect(
      page.getByRole("heading", { name: /Aksiyalar va vitrinalar/i }),
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByText(/Joriy sessiyadagi sinxronizatsiya tarixi/i),
    ).toBeVisible();

    const dashboardHtml = await page.content();
    expect(dashboardHtml).not.toContain("sora_revalidate_secret_2026");

    // Logout restores login gate
    await page.getByRole("button", { name: /Chiqish/i }).click();
    await expect(page.locator("#audit-password")).toBeVisible({
      timeout: 15000,
    });
  });
});
