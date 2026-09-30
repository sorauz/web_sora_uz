import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("FAZA 7: Performance va Monitoring (Core Web Vitals)", () => {
  test("1. Font va Preconnect optimallashtirilgan bo'lishi kerak", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/uz`, { waitUntil: "domcontentloaded" });

    // Preconnect links in head
    const preconnectIbb = page.locator('link[rel="preconnect"][href="https://i.ibb.co"]');
    await expect(preconnectIbb).toHaveCount(1);

    const preconnect1C = page.locator('link[rel="preconnect"][href="http://sora.uz:777"]');
    await expect(preconnect1C).toHaveCount(1);

    // Font class or variable is attached to html or body
    const html = page.locator("html");
    await expect(html).toHaveAttribute("class", /--font-sans/);
  });

  test("2. Google Analytics va Monitoring skriptlari mavjud bo'lishi kerak", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/uz`, { waitUntil: "domcontentloaded" });

    // Google Tag Manager / Analytics script check
    const gtagScript = page.locator(
      'script[src*="googletagmanager.com/gtag/js"]'
    );
    await expect(gtagScript).toHaveCount(1);

    // Inline GA script check
    const inlineGaScript = page.locator('script#google-analytics');
    await expect(inlineGaScript).toHaveCount(1);
    const content = await inlineGaScript.textContent();
    expect(content).toContain("dataLayer");
  });

  test("3. Hero LCP rasm priority va sizes bilan render bo'lishi kerak (CLS himoyasi)", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/uz`, { waitUntil: "domcontentloaded" });

    // Main Hero showcase image has priority (fetchpriority="high")
    const heroImage = page.locator('img[alt="Deli E3871 Kombi perpletka mashinasi"]');
    await expect(heroImage).toBeVisible();

    // Check fetchpriority is high (Next.js sets fetchpriority="high" for priority images)
    const fetchPriority = await heroImage.getAttribute("fetchpriority");
    expect(fetchPriority).toBe("high");

    // Sizes attribute should be present to prevent CLS
    const sizes = await heroImage.getAttribute("sizes");
    expect(sizes).toBeTruthy();
  });

  test("4. Mahsulot sahifasi (PDP) galereya rasmi priority bilan yuklanishi kerak", async ({
    page,
  }) => {
    // Open Deli E3871 product page
    await page.goto(
      `${BASE_URL}/uz/products/kombinirovanniy-pereplyotnaya-mashina-deli-no-e3871`,
      { waitUntil: "domcontentloaded" }
    );

    const mainImage = page.locator('img[alt="Kombinirovanniy pereplyotnaya mashina Deli №E3871"]');
    await expect(mainImage).toBeVisible();

    const fetchPriority = await mainImage.getAttribute("fetchpriority");
    expect(fetchPriority).toBe("high");

    const sizes = await mainImage.getAttribute("sizes");
    expect(sizes).toBeTruthy();
  });

  test("5. On-Demand Revalidation Webhook xavfsizligi va ishlashi", async ({
    request,
  }) => {
    // 5.1. Noto'g'ri secret berilganda 401 Unauthorized qaytarishi kerak
    const resUnauthorized = await request.get(
      `${BASE_URL}/api/revalidate?secret=notogri_parol&tag=products`
    );
    expect(resUnauthorized.status()).toBe(401);
    const jsonUnauth = await resUnauthorized.json();
    expect(jsonUnauth.revalidated).toBe(false);

    // 5.2. Tag yoki path berilmaganda 400 Bad Request qaytarishi kerak
    const resBad = await request.get(
      `${BASE_URL}/api/revalidate?secret=sora_revalidate_secret_2026`
    );
    expect(resBad.status()).toBe(400);

    // 5.3. To'g'ri secret va tag berilganda 200 OK qaytarishi kerak
    const resOkTag = await request.get(
      `${BASE_URL}/api/revalidate?secret=sora_revalidate_secret_2026&tag=products`
    );
    expect(resOkTag.status()).toBe(200);
    const jsonOk = await resOkTag.json();
    expect(jsonOk.revalidated).toBe(true);
    expect(jsonOk.tag).toBe("products");

    // 5.4. POST so'rovi orqali revalidation
    const resPost = await request.post(`${BASE_URL}/api/revalidate`, {
      data: {
        secret: "sora_revalidate_secret_2026",
        path: "/uz",
      },
    });
    expect(resPost.status()).toBe(200);
    const jsonPost = await resPost.json();
    expect(jsonPost.revalidated).toBe(true);
    expect(jsonPost.path).toBe("/uz");
  });
});
