import { test, expect } from "@playwright/test";

test.describe("1C ERP FAQ Integration & Schema.org FAQPage SEO", () => {
  test("1. Homepage renders 8 FAQ items in 2 columns with crawlable DOM and FAQPage JSON-LD", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/uz");

    const faqSection = page.getByTestId("faq-accordion");
    await expect(faqSection).toBeVisible();
    await expect(faqSection).toContainText(/Ko‘p beriladigan savollar/i);

    const faqItems = faqSection.getByTestId("faq-item");
    await expect(faqItems).toHaveCount(8);

    // Verify answer paragraph is attached in SSR HTML even while collapsed (SEO crawlability)
    const firstItem = faqItems.first();
    const firstTrigger = firstItem.locator("button[aria-expanded]");
    await expect(firstTrigger).toHaveAttribute("aria-expanded", "false");
    const firstAnswerParagraph = firstItem.locator("div[role='region'] p").first();
    await expect(firstAnswerParagraph).toBeAttached();

    // Interactive expand / collapse
    await firstTrigger.click();
    await expect(firstTrigger).toHaveAttribute("aria-expanded", "true");
    await expect(firstAnswerParagraph).toBeVisible();

    // Verify single FAQPage JSON-LD matching visible questions
    const jsonLdScripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const faqLdTexts = jsonLdScripts.filter((txt) =>
      txt.includes('"@type":"FAQPage"')
    );
    expect(faqLdTexts).toHaveLength(1);

    const faqLd = JSON.parse(faqLdTexts[0]);
    expect(faqLd.mainEntity).toHaveLength(8);
  });

  test("2. Category 'Chop etish uchun qog'oz' shows live 1C '80 g/m²' paper density FAQ", async ({
    page,
  }) => {
    await page.goto("/uz/category/chop-etish-uchun-qogoz");

    const faqSection = page.getByTestId("faq-accordion");
    await expect(faqSection).toBeVisible();
    await expect(faqSection).toContainText(/zichlikdagi A4 qog‘oz/i);
    await expect(faqSection).toContainText(/80 g\/m²/i);

    const jsonLdScripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const faqLdText = jsonLdScripts.find((txt) =>
      txt.includes('"@type":"FAQPage"')
    );
    expect(faqLdText).toBeTruthy();
    expect(faqLdText).toContain("80 g/m²");
  });

  test("3. Product 'Deli E3894 laminator' shows product-specific 250 micron FAQ and Deli brand 12-month warranty FAQ", async ({
    page,
  }) => {
    await page.goto("/uz/products/deli-e3894-eu-a3-laminator-yengil-ofis-jihozi");

    // Both answers must already exist in DOM before clicking the FAQ tab (Googlebot crawlable)
    const faqTabPanel = page
      .locator('div[role="tabpanel"]')
      .filter({ hasText: /250 mikron/i })
      .first();
    await expect(faqTabPanel).toBeAttached();
    await expect(faqTabPanel).toContainText(/12 oylik rasmiy servis kafolati/i);

    // Open FAQ tab interactively and check visibility
    const faqTabBtn = page.getByRole("button", { name: /savol-javoblar/i });
    await expect(faqTabBtn).toBeVisible();
    await faqTabBtn.click();

    await expect(faqTabPanel).toBeVisible();
    await expect(faqTabPanel.getByText(/necha mikrongacha/i)).toBeVisible();
    await expect(faqTabPanel.getByText(/Deli ofis texnikasi/i)).toBeVisible();

    // Verify FAQPage JSON-LD includes both 250 micron and Deli warranty items
    const jsonLdScripts = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const faqLdText = jsonLdScripts.find((txt) =>
      txt.includes('"@type":"FAQPage"')
    );
    expect(faqLdText).toBeTruthy();
    expect(faqLdText).toContain("250 mikron");
    expect(faqLdText).toContain("12 oylik");
  });

  test("4. Brand page (/uz/brand/deli) and static pages (/uz/delivery, /uz/b2b) render live 1C FAQs", async ({
    page,
  }) => {
    // Brand page
    await page.goto("/uz/brand/deli");
    const brandFaq = page.getByTestId("faq-accordion");
    await expect(brandFaq).toBeVisible();
    await expect(brandFaq).toContainText(/Deli ofis texnikasi/i);

    // Delivery page
    await page.goto("/uz/delivery");
    const deliveryFaq = page.getByTestId("faq-accordion");
    await expect(deliveryFaq).toBeVisible();
    await expect(deliveryFaq).toContainText(/Toshkent shahri bo‘ylab yetkazib berish/i);

    // B2B page
    await page.goto("/uz/b2b");
    const b2bFaq = page.getByTestId("faq-accordion");
    await expect(b2bFaq).toBeVisible();
    await expect(b2bFaq).toContainText(/ulgurji \(optom\)|hisob-faktura/i);
  });
});
