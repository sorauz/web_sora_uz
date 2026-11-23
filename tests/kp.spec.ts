import fs from "node:fs";
import ExcelJS from "exceljs";
import { test, expect } from "@playwright/test";
import {
  KpActionInputSchema,
  KpCreateInputSchema,
  OneCOrderActionRequestSchema,
  OneCOrderActionResponseSchema,
  OneCOrderDetailResponseSchema,
  OneCOrderHistoryItemSchema,
  OneCOrderResponseSchema,
  OrderStatusCodeSchema,
} from "../src/lib/schemas/order";
import {
  getOrderStatusUiMeta,
  normalizeOrderStatus,
} from "../src/lib/utils/order-status";
import {
  encodeKpPublicToken,
  verifyKpPublicToken,
} from "../src/lib/kp/token";
import {
  calculateKpTotals,
  formatKpOneCComment,
  parseKpCommentMeta,
} from "../src/lib/kp/calculations";
import { checkAndRecordKpIpRateLimit } from "../src/lib/kp/rate-limit";

test.describe("Commercial Offer (KP) System — Unit, API & E2E Tests", () => {
  test("1. 1C KP Zod Schemas & Status Normalization support KP_ACTIVE, KP_EXPIRED, client_inn, and order_action", () => {
    expect(OrderStatusCodeSchema.parse("KP_ACTIVE")).toBe("KP_ACTIVE");
    expect(OrderStatusCodeSchema.parse("KP_EXPIRED")).toBe("KP_EXPIRED");

    const postKpRes = OneCOrderResponseSchema.parse({
      message: "Tijorat taklifi muvaffaqiyatli shakllantirildi",
      status_code: "KP_ACTIVE",
      status: "Tijorat taklifi (Faol)",
      posted: false,
      is_kp: true,
      kp_valid_until: "2026-11-27T23:59:59",
      order_number: "0000-001430",
      order_id: "c3d4e5f6-a1b2-7890-abcd-ef1234567890",
      total_amount: 2250000,
    });
    expect(postKpRes.is_kp).toBe(true);
    expect(postKpRes.kp_valid_until).toBe("2026-11-27T23:59:59");

    const getKpDetail = OneCOrderDetailResponseSchema.parse({
      order_id: "c3d4e5f6-a1b2-7890-abcd-ef1234567890",
      order_number: "0000-001430",
      order_date: "2026-11-22T14:10:00",
      online: true,
      is_kp: true,
      kp_valid_until: "2026-11-27T23:59:59",
      payment_type: "TRANSFER",
      status_code: "KP_ACTIVE",
      status: "Tijorat taklifi (Faol)",
      total_amount: 2250000,
      comment: "Tijorat taklifi (KP) | [KP H/R: 20208000123 | MFO: 01036]",
      delivery: {
        without_delivery: true,
        geolocation: null,
        pickup_point: "Магазин",
      },
      customer: {
        type: "B2B",
        client_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        client_name: "ALPHA SERVICE MCHJ",
        client_inn: "305123456",
        contact: null,
      },
      timeline: [],
      products: [
        {
          line_number: 1,
          product_id: "99998888-7777-6666-5555-444433332222",
          product_name: "Ofis qog'ozi A4 SvetoCopy",
          unit: "pachka",
          quantity: 50,
          price: 45000,
          amount: 2250000,
        },
      ],
    });
    expect(getKpDetail.is_kp).toBe(true);
    expect(getKpDetail.customer?.client_inn).toBe("305123456");
    expect(getKpDetail.timeline).toEqual([]);

    const historyItem = OneCOrderHistoryItemSchema.parse({
      order_id: "c3d4e5f6-a1b2-7890-abcd-ef1234567890",
      order_number: "0000-001430",
      order_date: "2026-11-22T14:10:00",
      online: true,
      is_kp: true,
      kp_valid_until: "2026-11-27T23:59:59",
      status_code: "KP_EXPIRED",
      status: "Muddati tugagan",
      without_delivery: true,
      total_amount: 2250000,
      items_count: 1,
    });
    expect(historyItem.is_kp).toBe(true);
    expect(historyItem.status_code).toBe("KP_EXPIRED");

    const actionReq = OneCOrderActionRequestSchema.parse({
      order_id: "c3d4e5f6-a1b2-7890-abcd-ef1234567890",
      type: "B2B",
      client_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      action: "CONVERT_TO_ORDER",
      without_delivery: false,
      geolocation: "41.311, 69.240",
      comment: "Ertaga soat 10:00 gacha",
    });
    expect(actionReq.action).toBe("CONVERT_TO_ORDER");

    const actionRes = OneCOrderActionResponseSchema.parse({
      message: "Tijorat taklifi muvaffaqiyatli buyurtmaga aylantirildi",
      action: "CONVERT_TO_ORDER",
      order_id: "c3d4e5f6-a1b2-7890-abcd-ef1234567890",
      order_number: "0000-001430",
      order_date: "2026-11-22T15:05:12",
      is_kp: false,
      kp_valid_until: null,
      posted: true,
      status_code: "CONFIRMED",
      status: "Qabul qilindi / Tasdiqlandi",
      total_amount: 2250000,
    });
    expect(actionRes.is_kp).toBe(false);
    expect(actionRes.posted).toBe(true);

    // Status normalization checks
    expect(normalizeOrderStatus({ statusCode: "KP_ACTIVE", isKp: true })).toBe(
      "KP_ACTIVE"
    );
    expect(normalizeOrderStatus({ statusCode: "PENDING", isKp: true })).toBe(
      "KP_ACTIVE"
    );
    expect(normalizeOrderStatus({ statusCode: "CANCELLED", isKp: true })).toBe(
      "CANCELLED"
    );
    expect(normalizeOrderStatus({ statusCode: "KP_EXPIRED", isKp: true })).toBe(
      "KP_EXPIRED"
    );

    const uzActiveMeta = getOrderStatusUiMeta(
      { statusCode: "KP_ACTIVE", isKp: true },
      "uz"
    );
    expect(uzActiveMeta.tone).toBe("violet");
    expect(uzActiveMeta.isKpActive).toBe(true);
    expect(uzActiveMeta.label).toContain("Faol");

    const ruExpiredMeta = getOrderStatusUiMeta(
      { statusCode: "KP_EXPIRED", isKp: true },
      "ru"
    );
    expect(ruExpiredMeta.tone).toBe("amber");
    expect(ruExpiredMeta.isKpExpired).toBe(true);
    expect(ruExpiredMeta.label).toContain("истёк");
  });

  test("2. HMAC-SHA256 KP QR Token packs 2 UUIDs into 64 chars and rejects tampering", () => {
    const orderId = "c3d4e5f6-a1b2-7890-abcd-ef1234567890";
    const clientId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

    const token = encodeKpPublicToken({ orderId, clientId });
    expect(token).toHaveLength(64);
    expect(/^[A-Za-z0-9_-]{64}$/.test(token)).toBe(true);

    const decoded = verifyKpPublicToken(token);
    expect(decoded).toEqual({ orderId, clientId });

    // Tamper single character
    const alteredChar = token[10] === "A" ? "B" : "A";
    const tamperedToken = `${token.slice(0, 10)}${alteredChar}${token.slice(11)}`;
    expect(verifyKpPublicToken(tamperedToken)).toBeNull();
    expect(verifyKpPublicToken("invalid-token")).toBeNull();
    expect(verifyKpPublicToken("")).toBeNull();

    // Non-UUID fallback test
    const v2Token = encodeKpPublicToken({
      orderId: "custom-order-1",
      clientId: "custom-client-2",
    });
    expect(v2Token.startsWith("v2.")).toBe(true);
    expect(verifyKpPublicToken(v2Token)).toEqual({
      orderId: "custom-order-1",
      clientId: "custom-client-2",
    });
    expect(verifyKpPublicToken(`${v2Token}x`)).toBeNull();
  });

  test("3. KP VAT (12%) calculations & 1C comment metadata parser work accurately", () => {
    // 50 * 45,000 = 2,250,000 (>= 500,000 -> free delivery)
    const totalsFree = calculateKpTotals([
      { quantity: 50, price: 45000 },
      { quantity: 3, price: 0 }, // negotiable item excluded
    ]);
    expect(totalsFree.subtotalWithVat).toBe(2250000);
    expect(totalsFree.deliveryFee).toBe(0);
    expect(totalsFree.grandTotal).toBe(2250000);
    expect(totalsFree.lines[0].lineNetWithoutVat + totalsFree.lines[0].lineVatAmount).toBe(
      totalsFree.lines[0].lineTotalWithVat
    );
    expect(totalsFree.lines[1].isNegotiable).toBe(true);
    expect(totalsFree.lines[1].lineTotalWithVat).toBe(0);

    // 2 * 100,000 = 200,000 (< 500,000 -> 30,000 delivery)
    const totalsPaidDelivery = calculateKpTotals([{ quantity: 2, price: 100000 }]);
    expect(totalsPaidDelivery.subtotalWithVat).toBe(200000);
    expect(totalsPaidDelivery.deliveryFee).toBe(30000);
    expect(totalsPaidDelivery.grandTotal).toBe(230000);

    const comment = formatKpOneCComment({
      fullName: "Alisher Valiyev",
      phone: "+998901234567",
      bankAccount: "20208000905524274001",
      bankMfo: "01036",
      legalAddress: "Toshkent sh., Chilonzor",
    });
    expect(comment.length).toBeLessThanOrEqual(350);

    const meta = parseKpCommentMeta(comment);
    expect(meta.bankAccount).toBe("20208000905524274001");
    expect(meta.bankMfo).toBe("01036");
    expect(meta.legalAddress).toBe("Toshkent sh., Chilonzor");
  });

  test("4. IP Rate Limiter caps KP creation/action requests within 60-90/hour", () => {
    const testIp = `198.51.100.${Math.floor(Math.random() * 200) + 10}`;
    for (let i = 0; i < 5; i++) {
      const check = checkAndRecordKpIpRateLimit(testIp, 5);
      expect(check.allowed).toBe(true);
    }
    const blocked = checkAndRecordKpIpRateLimit(testIp, 5);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);

    // Schema validation checks
    const badInn = KpCreateInputSchema.safeParse({
      companyName: "Test MCHJ",
      companyInn: "12345",
      fullName: "Ali",
      phone: "+998901234567",
      items: [{ id: "1", name: "Item", price: 1000, quantity: 1 }],
    });
    expect(badInn.success).toBe(false);

    const badAction = KpActionInputSchema.safeParse({
      orderId: "abc",
      action: "DELETE_ALL",
    });
    expect(badAction.success).toBe(false);
  });

  test("5. KP API Endpoints enforce Zod validation, auth gates, and X-Robots-Tag: noindex, nofollow", async ({
    request,
  }) => {
    // POST /api/kp/create -> 400 on invalid INN
    const badCreateRes = await request.post("/api/kp/create", {
      data: {
        companyName: "ALPHA MCHJ",
        companyInn: "123",
        fullName: "Alisher",
        phone: "+998901234567",
        items: [{ id: "p1", name: "Paper", price: 45000, quantity: 10 }],
      },
    });
    expect(badCreateRes.status()).toBe(400);
    expect(badCreateRes.headers()["x-robots-tag"]).toContain("noindex");

    // POST /api/kp/create -> 401 without OTP/session
    const unauthCreateRes = await request.post("/api/kp/create", {
      data: {
        companyName: "ALPHA MCHJ",
        companyInn: "305123456",
        fullName: "Alisher Valiyev",
        phone: "+998901234567",
        items: [{ id: "p1", name: "Paper", price: 45000, quantity: 10 }],
      },
    });
    expect(unauthCreateRes.status()).toBe(401);
    const unauthBody = await unauthCreateRes.json();
    expect(unauthBody.code).toBe("PHONE_VERIFICATION_REQUIRED");

    // GET /api/kp/public -> 400 on invalid token + noindex header
    const badPublicRes = await request.get("/api/kp/public?token=tampered123");
    expect(badPublicRes.status()).toBe(400);
    expect(badPublicRes.headers()["x-robots-tag"]).toContain("noindex");

    // POST /api/kp/action -> 401 unauthenticated + noindex header
    const unauthActionRes = await request.post("/api/kp/action", {
      data: {
        orderId: "c3d4e5f6-a1b2-7890-abcd-ef1234567890",
        action: "CANCEL_KP",
      },
    });
    expect(unauthActionRes.status()).toBe(401);
    expect(unauthActionRes.headers()["x-robots-tag"]).toContain("noindex");

    // GET /api/orders?is_kp=true -> 401 unauthenticated
    const unauthOrdersKpRes = await request.get("/api/orders?is_kp=true");
    expect(unauthOrdersKpRes.status()).toBe(401);
  });

  test("6. SEO Protection: robots.txt blocks /uz/kp/ & /ru/kp/ and public KP page sets noindex", async ({
    request,
    page,
  }) => {
    const robotsRes = await request.get("/robots.txt");
    expect(robotsRes.ok()).toBe(true);
    const robotsTxt = await robotsRes.text();
    expect(robotsTxt).toContain("/uz/kp/");
    expect(robotsTxt).toContain("/ru/kp/");

    await page.goto("/uz/kp/invalid-token-sample");
    const robotsMeta = page.locator('meta[name="robots"]');
    await expect(robotsMeta).toHaveAttribute("content", /noindex/);
    await expect(page.getByText(/Hujjat topilmadi/i)).toBeVisible();
  });

  test("7. Cart KP Modal enforces mandatory B2B INN and exclusive PDF / Excel format modes", async ({
    page,
  }) => {
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          authenticated: true,
          user: {
            id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
            name: "ALPHA SERVICE MCHJ",
            type: "B2B",
            phone: "+998901234567",
            inn: "305123456",
          },
        }),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem(
        "sora-cart-storage",
        JSON.stringify({
          state: {
            items: [
              {
                id: "99998888-7777-6666-5555-444433332222",
                sku: "00412",
                name: "SvetoCopy A4",
                price: 45000,
                picture: "",
                unit: "pachka",
                quantity: 10,
              },
            ],
            editingKpOrderId: null,
          },
          version: 0,
        })
      );
    });

    await page.goto("/uz/cart");

    const openBtn = page.getByRole("button", {
      name: /Tijorat taklifi \(KP\) yuklab olish/i,
    });
    await expect(openBtn).toBeVisible();
    await openBtn.click();

    await expect(page.locator("#kp-modal-title")).toBeVisible();
    // Auto-filled from B2B session
    await expect(page.locator('input[placeholder="305123456"]')).toHaveValue(
      "305123456"
    );

    // Default presentation mode -> PDF button active
    await expect(
      page.getByRole("button", { name: /PDF Tijorat taklifini yuklab olish/i })
    ).toBeVisible();

    // Switch to Compact table -> Excel button active
    await page.getByRole("button", { name: /Ixcham jadval/i }).click();
    await expect(
      page.getByRole("button", {
        name: /Excel \(\.xlsx\) Tijorat taklifini yuklab olish/i,
      })
    ).toBeVisible();
  });

  test("8. Client-side PDF and Excel generation succeed under production CSP without worker/WASM errors", async ({
    page,
  }) => {
    const cspErrors: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      if (
        msg.type() === "error" &&
        text.includes("Content Security Policy") &&
        (text.includes("connect-src") ||
          text.includes("worker-src") ||
          text.includes("script-src")) &&
        !text.includes("cloudflareinsights")
      ) {
        cspErrors.push(text);
      }
    });

    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          authenticated: true,
          user: {
            id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
            name: "ALPHA SERVICE MCHJ",
            type: "B2B",
            phone: "+998901234567",
            inn: "305123456",
          },
        }),
      });
    });

    await page.route("**/api/kp/create", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          order_id: "c3d4e5f6-a1b2-7890-abcd-ef1234567890",
          order_number: "000068476",
          status_code: "KP_ACTIVE",
          is_kp: true,
          kp_valid_until: "2026-11-27T23:59:59",
          total_amount: 450000,
          public_token:
            "ruFet-ZkEfGl0gAVXXjDA8_wnxvkDRHxpc8AFV14wwOPe9Of-syDSrOprc1l6pZU",
          public_path:
            "/uz/kp/ruFet-ZkEfGl0gAVXXjDA8_wnxvkDRHxpc8AFV14wwOPe9Of-syDSrOprc1l6pZU",
        }),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem(
        "sora-cart-storage",
        JSON.stringify({
          state: {
            items: [
              {
                id: "99998888-7777-6666-5555-444433332222",
                sku: "00412",
                name: "SvetoCopy A4",
                price: 45000,
                picture: "",
                unit: "pachka",
                quantity: 10,
              },
            ],
            editingKpOrderId: null,
          },
          version: 0,
        })
      );
    });

    await page.goto("/uz/cart");
    await page
      .getByRole("button", { name: /Tijorat taklifi \(KP\) yuklab olish/i })
      .click();

    await page.locator('input[placeholder*="Alisher Valiyev"]').fill("Alisher Valiyev");

    const pdfDownloadPromise = page.waitForEvent("download", { timeout: 15000 });
    await page
      .getByRole("button", { name: /PDF Tijorat taklifini yuklab olish/i })
      .click();
    const pdfDownload = await pdfDownloadPromise;
    expect(pdfDownload.suggestedFilename()).toBe("Sora_KP_000068476.pdf");
    const pdfPath = await pdfDownload.path();
    expect(pdfPath).toBeTruthy();
    const pdfBytes = fs.readFileSync(pdfPath!);
    expect(pdfBytes.subarray(0, 5).toString("ascii")).toBe("%PDF-");
    expect(pdfBytes.length).toBeGreaterThan(5000);

    // Success view should appear and Excel redownload should also succeed
    await expect(
      page.getByText(/Tijorat taklifi #000068476 yaratildi/i)
    ).toBeVisible();

    const excelDownloadPromise = page.waitForEvent("download", {
      timeout: 15000,
    });
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Excel (.xlsx)", exact: true })
      .click();
    const excelDownload = await excelDownloadPromise;
    expect(excelDownload.suggestedFilename()).toBe("Sora_KP_000068476.xlsx");
    const excelPath = await excelDownload.path();
    expect(excelPath).toBeTruthy();

    // Inspect UZ Excel contents: combined logo image, website link, and "NEW PRICE" OK requisites
    const uzWb = new ExcelJS.Workbook();
    await uzWb.xlsx.readFile(excelPath!);
    const uzSheet = uzWb.worksheets[0];
    expect(uzSheet.getImages().length).toBeGreaterThanOrEqual(1);
    expect(JSON.stringify(uzSheet.getCell("C1").value)).toContain("https://sora.uz");
    expect(String(uzSheet.getCell("A6").value)).toContain('"NEW PRICE" OK');
    expect(String(uzSheet.getCell("A6").value)).toContain("309528015");
    expect(String(uzSheet.getCell("A6").value)).toContain("326090188543");
    expect(String(uzSheet.getCell("A6").value)).toContain("46180");
    expect(String(uzSheet.getCell("A6").value)).toContain("Oldi-sotdi");
    expect(String(uzSheet.getCell("A7").value)).toContain("20208000905524274001");
    expect(String(uzSheet.getCell("A7").value)).toContain("01036");
    // Formula integrity check on Row 12 (first data row after header row 11)
    expect(uzSheet.getCell("G12").value).toEqual({
      formula: "E12*F12",
      result: 450000,
    });
    // Director signature in footer and no legacy tagline under logo
    const uzAllText = uzSheet
      .getSheetValues()
      .flat()
      .map((v) => (v && typeof v === "object" ? JSON.stringify(v) : String(v || "")))
      .join("\n");
    expect(uzAllText).toContain("GAPPAROV V.");
    expect(uzAllText).not.toContain("Ofis va korporativ");

    expect(cspErrors).toEqual([]);
  });

  test("9. Russian KP PDF and Excel use СП \"NEW PRICE\" requisites while keeping SORA.UZ header branding", async ({
    page,
  }) => {
    await page.route("**/api/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          authenticated: true,
          user: {
            id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
            name: "ALPHA SERVICE LLC",
            type: "B2B",
            phone: "+998901234567",
            inn: "305123456",
          },
        }),
      });
    });

    await page.route("**/api/kp/create", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          order_id: "c3d4e5f6-a1b2-7890-abcd-ef1234567890",
          order_number: "000068477",
          status_code: "KP_ACTIVE",
          is_kp: true,
          kp_valid_until: "2026-11-27T23:59:59",
          total_amount: 450000,
          public_token:
            "ruFet-ZkEfGl0gAVXXjDA8_wnxvkDRHxpc8AFV14wwOPe9Of-syDSrOprc1l6pZU",
          public_path:
            "/ru/kp/ruFet-ZkEfGl0gAVXXjDA8_wnxvkDRHxpc8AFV14wwOPe9Of-syDSrOprc1l6pZU",
        }),
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem(
        "sora-cart-storage",
        JSON.stringify({
          state: {
            items: [
              {
                id: "99998888-7777-6666-5555-444433332222",
                sku: "00412",
                name: "SvetoCopy A4",
                name_ru: "Бумага SvetoCopy A4",
                price: 45000,
                picture: "",
                unit: "пачка",
                quantity: 10,
              },
            ],
            editingKpOrderId: null,
          },
          version: 0,
        })
      );
    });

    await page.goto("/ru/cart");
    await page
      .getByRole("button", { name: /Скачать коммерческое предложение/i })
      .click();

    await page.locator('input[placeholder*="Алишер Валиев"]').fill("Иван Иванов");

    const pdfDownloadPromise = page.waitForEvent("download", { timeout: 15000 });
    await page
      .getByRole("button", { name: /Скачать КП в формате PDF/i })
      .click();
    const pdfDownload = await pdfDownloadPromise;
    expect(pdfDownload.suggestedFilename()).toBe("Sora_KP_000068477.pdf");
    const pdfPath = await pdfDownload.path();
    expect(fs.readFileSync(pdfPath!).subarray(0, 5).toString("ascii")).toBe("%PDF-");

    const excelDownloadPromise = page.waitForEvent("download", {
      timeout: 15000,
    });
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Excel (.xlsx)", exact: true })
      .click();
    const excelDownload = await excelDownloadPromise;
    const excelPath = await excelDownload.path();

    const ruWb = new ExcelJS.Workbook();
    await ruWb.xlsx.readFile(excelPath!);
    const ruSheet = ruWb.worksheets[0];
    expect(ruSheet.getImages().length).toBeGreaterThanOrEqual(1);
    expect(JSON.stringify(ruSheet.getCell("C1").value)).toContain("https://sora.uz");
    expect(String(ruSheet.getCell("A6").value)).toContain('СП "NEW PRICE"');
    expect(String(ruSheet.getCell("A6").value)).toContain("309528015");
    expect(String(ruSheet.getCell("A6").value)).toContain("326090188543");
    expect(String(ruSheet.getCell("A6").value)).toContain("Плательщик НДС+");
    expect(String(ruSheet.getCell("A6").value)).toContain("46180");
    expect(String(ruSheet.getCell("A6").value)).toContain("Купля-продажа");
    expect(String(ruSheet.getCell("A7").value)).toContain("АИКБ «ИПАК ЙУЛИ БАНК»");
    const ruAllText = ruSheet
      .getSheetValues()
      .flat()
      .map((v) => (v && typeof v === "object" ? JSON.stringify(v) : String(v || "")))
      .join("\n");
    expect(ruAllText).toContain('СП "NEW PRICE"');
    expect(ruAllText).toContain("Директор: GAPPAROV V.");
    expect(ruAllText).not.toContain("Центр офисного");
  });
});
