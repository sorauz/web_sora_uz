import { test, expect } from "@playwright/test";

test.describe("1-Click Buy (1 klikda xarid qilish) Rules & Modal Flow", () => {
  test("1. Products under 200,000 UZS do NOT show '1 klikda xarid qilish' button", async ({
    page,
  }) => {
    // Calculator under 200,000 UZS
    await page.goto("/uz/products/deli-e1589-12-raqamli-kalkulyator-yashil");

    await expect(page.locator("h1")).toContainText("Deli E1589");

    // Add to Cart button must be visible
    const addToCartBtn = page.getByRole("button", { name: /savatga qo'shish/i });
    await expect(addToCartBtn).toBeVisible();

    // 1-Click Buy button must NOT be rendered
    const buyNowBtn = page.getByRole("button", { name: /1 klikda xarid qilish/i });
    await expect(buyNowBtn).toHaveCount(0);
  });

  test("2. Products >= 200,000 UZS show '1 klikda xarid qilish', allow changing quantity, choosing delivery method, and picking map location", async ({
    page,
  }) => {
    // Money counter > 200,000 UZS
    await page.goto(
      "/uz/products/deli-e3904-pul-hisoblagich-900-banknot-daq-uv-mg-ir-golden"
    );

    await expect(page.locator("h1")).toContainText("Deli E3904");

    // 1-Click Buy button must be visible
    const buyNowBtn = page.getByRole("button", { name: /1 klikda xarid qilish/i });
    await expect(buyNowBtn).toBeVisible();
    await buyNowBtn.click();

    // Modal opens
    const modal = page.getByTestId("fast-order-modal");
    await expect(modal).toBeVisible();

    // 1. Test Quantity modification inside modal
    const qtyInput = page.getByTestId("fast-order-qty-input");
    const qtyPlus = page.getByTestId("fast-order-qty-plus");
    const qtyMinus = page.getByTestId("fast-order-qty-minus");
    const totalAmountEl = page.getByTestId("fast-order-total-amount");

    await expect(qtyInput).toHaveValue("1");
    const initialTotalText = await totalAmountEl.textContent();

    // Increase quantity to 2
    await qtyPlus.click();
    await expect(qtyInput).toHaveValue("2");
    const doubledTotalText = await totalAmountEl.textContent();
    expect(doubledTotalText).not.toBe(initialTotalText);

    // Decrease quantity back to 1
    await qtyMinus.click();
    await expect(qtyInput).toHaveValue("1");
    expect(await totalAmountEl.textContent()).toBe(initialTotalText);

    // 2. Verify Delivery Method options (Courier vs Pickup)
    const courierOption = page.getByTestId("fast-order-delivery-courier");
    const pickupOption = page.getByTestId("fast-order-delivery-pickup");
    await expect(courierOption).toBeVisible();
    await expect(pickupOption).toBeVisible();

    // Default is Courier -> Map Picker box must be visible
    const mapBox = page.getByTestId("fast-order-map-box");
    await expect(mapBox).toBeVisible();

    // Submitting Courier without selecting map point shows validation error
    const submitBtn = modal.getByRole("button", { name: /buyurtmani tasdiqlash/i });
    await submitBtn.click();
    await expect(page.getByTestId("fast-order-error")).toBeVisible();

    // Open Map Picker Modal and confirm location
    await page.getByTestId("fast-order-open-map-btn").click();
    await expect(
      page.getByText(/Yetkazib berish nuqtasini xaritadan tanlang/i)
    ).toBeVisible();

    const confirmLocationBtn = page.getByRole("button", {
      name: /Shu nuqtani tasdiqlash/i,
    });
    await confirmLocationBtn.click();

    // Verify map point is saved in 1-Click modal
    await expect(modal.getByText(/Yetkazish nuqtasi belgilandi/i)).toBeVisible();
    await expect(page.getByTestId("fast-order-error")).toHaveCount(0);

    // 3. Switch to Self Pickup (O'zi olib ketish)
    await pickupOption.click();
    await expect(mapBox).toHaveCount(0);
    await expect(page.getByTestId("fast-order-pickup-info")).toBeVisible();
  });
});
