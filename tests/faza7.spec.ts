import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("FAZA 7: Performance va Monitoring (Core Web Vitals)", () => {
  test("1. Font va Preconnect optimallashtirilgan bo'lishi kerak", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/uz`, { waitUntil: "domcontentloaded" });

    // Preconnect links in head for image CDN and 1C ERP
    const preconnectIbb = page.locator('link[rel="preconnect"][href="https://i.ibb.co"]');
    await expect(preconnectIbb).toHaveCount(1);

    const preconnect1C = page.locator('link[rel="preconnect"][href="http://1cloud.uz:777"]');
    await expect(preconnect1C).toHaveCount(1);

    // Font class or variable is attached to html (Next.js font optimization)
    const html = page.locator("html");
    await expect(html).toHaveAttribute("class", /plus_jakarta_sans|__variable/);
  });

  test("2. Google Analytics va Monitoring skriptlari mavjud bo'lishi kerak", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/uz`, { waitUntil: "load" });

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

    // Main Hero showcase image
    const heroImage = page.locator('img[alt="Deli E3871 Kombi perpletka mashinasi"]');
    await expect(heroImage).toBeVisible();

    // Priority ensures it is not lazy loaded (loading is 'auto' or 'eager')
    const loading = await heroImage.getAttribute("loading");
    expect(loading).not.toBe("lazy");

    // Sizes attribute prevents CLS (Cumulative Layout Shift)
    const sizes = await heroImage.getAttribute("sizes");
    expect(sizes).toBeTruthy();

    // Next.js Image Optimization generates /_next/image srcset
    const srcset = await heroImage.getAttribute("srcset");
    expect(srcset).toContain("/_next/image");
  });

  test("4. Mahsulot sahifasi (PDP) galereya rasmi priority va sizes bilan yuklanishi kerak", async ({
    page,
  }) => {
    // Open Deli E1589 product page
    await page.goto(
      `${BASE_URL}/uz/products/deli-e1589-12-raqamli-kalkulyator-yashil`,
      { waitUntil: "domcontentloaded" }
    );

    const mainImage = page.locator('img[alt="Deli E1589 12‑raqamli kalkulyator (Yashil)"]').first();
    await expect(mainImage).toBeVisible();

    // Priority prevents lazy loading for main LCP image
    const loading = await mainImage.getAttribute("loading");
    expect(loading).not.toBe("lazy");

    // Sizes attribute ensures proper responsive layout without CLS
    const sizes = await mainImage.getAttribute("sizes");
    expect(sizes).toBeTruthy();

    // Image uses Next.js edge optimization
    const src = await mainImage.getAttribute("src");
    expect(src).toContain("/_next/image");
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
