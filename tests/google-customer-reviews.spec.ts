import { test, expect } from "@playwright/test";

test.describe("Google Customer Reviews & Store Widget", () => {
  test("1. CSP headers permit Google Customer Reviews & Merchant Widget domains", async ({
    request,
  }) => {
    const res = await request.get("/uz");
    expect(res.status()).toBe(200);
    const csp = res.headers()["content-security-policy"] || "";

    expect(csp).toContain("https://apis.google.com");
    expect(csp).toContain("https://www.gstatic.com");
    expect(csp).toContain("https://www.google.com");
    expect(csp).toContain("https://customersurveys.google.com");
  });

  test("2. Public pages initialize Store Widget with UZ region and skip /internal-audit", async ({
    page,
  }) => {
    let widgetStartArgs: Record<string, unknown> | null = null;

    await page.route(
      "https://www.gstatic.com/shopping/merchant/merchantwidget.js*",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/javascript",
          body: `
            window.merchantwidget = {
              start: function(cfg) {
                window.__testMerchantWidgetConfig = cfg;
              }
            };
          `,
        });
      },
    );

    await page.goto("/uz");
    await page.waitForFunction(
      () =>
        Boolean(
          (window as unknown as { __testMerchantWidgetConfig?: unknown })
            .__testMerchantWidgetConfig,
        ),
      { timeout: 10000 },
    );

    widgetStartArgs = await page.evaluate(
      () =>
        (
          window as unknown as {
            __testMerchantWidgetConfig: Record<string, unknown>;
          }
        ).__testMerchantWidgetConfig,
    );

    expect(widgetStartArgs?.merchant_id).toBe(5882215725);
    expect(widgetStartArgs?.region).toBe("UZ");
    expect(widgetStartArgs?.position).toBe("LEFT_BOTTOM");

    // Verify /uz/internal-audit does not render merchantWidgetScript
    await page.goto("/uz/internal-audit");
    await expect(page.locator("#merchantWidgetScript")).toHaveCount(0);
  });

  test("3. Order success page skips surveyoptin when customer email is missing", async ({
    page,
  }) => {
    let platformRequested = false;

    await page.route(
      "https://apis.google.com/js/platform.js*",
      async (route) => {
        platformRequested = true;
        await route.abort();
      },
    );

    await page.addInitScript(() => {
      localStorage.setItem(
        "sora_last_order",
        JSON.stringify({
          orderId: "ORD-NO-EMAIL-1",
          orderNumber: "000070001",
          createdAt: "2026-11-23T10:00:00.000Z",
          fullName: "Test User",
          phone: "+998901234567",
          email: "",
          deliveryMethod: "courier",
          region: "Toshkent shahri",
          paymentMethod: "cash",
          total: 100000,
        }),
      );
    });

    await page.goto("/uz/checkout/success?orderId=ORD-NO-EMAIL-1");
    await expect(page.locator("#google-customer-reviews-platform")).toHaveCount(
      0,
    );
    expect(platformRequested).toBe(false);
  });

  test("4. Order success page loads surveyoptin with valid email and sends order + GTIN payload", async ({
    page,
  }) => {
    let platformRequested = false;

    await page.route(
      "https://apis.google.com/js/platform.js*",
      async (route) => {
        platformRequested = true;
        await route.fulfill({
          status: 200,
          contentType: "application/javascript",
          body: `
            window.gapi = {
              load: function(mod, cb) {
                window.__testGapiModules = window.__testGapiModules || [];
                window.__testGapiModules.push(mod);
                cb();
              },
              surveyoptin: {
                render: function(cfg) {
                  window.__testSurveyOptInConfig = cfg;
                }
              }
            };
            if (typeof window.renderOptIn === "function") {
              window.renderOptIn();
            }
          `,
        });
      },
    );

    await page.addInitScript(() => {
      localStorage.setItem(
        "sora_last_order",
        JSON.stringify({
          orderId: "ORD-WITH-EMAIL-2",
          orderNumber: "000070002",
          createdAt: "2026-11-23T10:00:00.000Z",
          fullName: "Test Buyer",
          phone: "+998901234567",
          email: "buyer@sora.uz",
          deliveryMethod: "courier",
          region: "Toshkent shahri",
          paymentMethod: "cash",
          items: [
            { id: "1", gtin: "6921734902290" },
            { id: "2", gtin: "invalid-gtin" },
          ],
          total: 250000,
        }),
      );
    });

    await page.goto("/uz/checkout/success?orderId=ORD-WITH-EMAIL-2");
    await page.waitForFunction(
      () =>
        Boolean(
          (window as unknown as { __testSurveyOptInConfig?: unknown })
            .__testSurveyOptInConfig,
        ),
      { timeout: 10000 },
    );

    const optInConfig = await page.evaluate(
      () =>
        (
          window as unknown as {
            __testSurveyOptInConfig: {
              merchant_id: number;
              order_id: string;
              email: string;
              delivery_country: string;
              estimated_delivery_date: string;
              products?: Array<{ gtin: string }>;
            };
          }
        ).__testSurveyOptInConfig,
    );

    expect(platformRequested).toBe(true);
    expect(optInConfig.merchant_id).toBe(5882215725);
    expect(optInConfig.order_id).toBe("000070002");
    expect(optInConfig.email).toBe("buyer@sora.uz");
    expect(optInConfig.delivery_country).toBe("UZ");
    expect(optInConfig.estimated_delivery_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(optInConfig.products).toEqual([{ gtin: "6921734902290" }]);
  });
});
