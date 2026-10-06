import { test, expect } from "@playwright/test";

test.describe("1C ERP Order Placement & Status Checking Flow", () => {
  test("1. POST /api/order/create validates input and returns 400 when empty items", async ({ request }) => {
    const res = await request.post("/api/order/create", {
      data: {
        customerType: "B2C",
        fullName: "Test User",
        phone: "+998901234567",
        deliveryMethod: "courier",
        paymentMethod: "cash",
        items: [],
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Buyurtma");
  });

  test("2. POST /api/order/create accepts valid B2C order and returns 201 with order_number and order_id", async ({
    request,
  }) => {
    const res = await request.post("/api/order/create", {
      data: {
        customerType: "B2C",
        fullName: "Alisher Navoiy",
        phone: "+998901234567",
        deliveryMethod: "courier",
        region: "Toshkent shahri",
        address: "Amir Temur ko'chasi 15-uy",
        paymentMethod: "cash",
        orderComment: "Eshik tagiga qo'yib keting",
        items: [
          {
            id: "65896d54-94da-11e9-8074-d43d7e011714",
            name: "Deli 0316 Stepler",
            price: 55000,
            quantity: 2,
          },
        ],
      },
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.order_id).toBeTruthy();
    expect(body.order_number).toBeTruthy();
    expect(body.order_number).toContain("РТ-");
  });

  test("3. POST /api/order/create accepts valid B2B order with company INN", async ({ request }) => {
    const res = await request.post("/api/order/create", {
      data: {
        customerType: "B2B",
        fullName: "Olim Shokirov",
        phone: "+998903265458",
        deliveryMethod: "pickup",
        paymentMethod: "b2b",
        companyName: "OOO TEST HOLDING",
        companyInn: "204393073",
        items: [
          {
            id: "65896d54-94da-11e9-8074-d43d7e011714",
            name: "Deli 0316 Stepler",
            price: 55000,
            quantity: 5,
          },
        ],
      },
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.order_id).toBeTruthy();
    expect(body.order_number).toBeTruthy();
  });

  test("4. GET /api/order/status requires orderId and returns order details or fallback", async ({
    request,
  }) => {
    // 4.1 Missing orderId returns 400
    const emptyRes = await request.get("/api/order/status");
    expect(emptyRes.status()).toBe(400);

    // 4.2 Querying order returns valid structure with status
    const testGuid = "e44c21a0-318a-11e8-812c-d43d7e011714";
    const statusRes = await request.get(`/api/order/status?orderId=${testGuid}`);
    expect([200, 404]).toContain(statusRes.status());
    const data = await statusRes.json();
    if (statusRes.status() === 200) {
      expect(data.order).toBeTruthy();
      expect(data.order.order_id).toBeTruthy();
    }
  });

  test("5. Full Checkout to Success Flow with Order Number and Live Status View", async ({
    page,
  }) => {
    // 1. Add item to cart via PDP
    await page.goto("/uz/products/deli-e1589-12-raqamli-kalkulyator-yashil");
    const addToCartBtn = page.getByRole("button", { name: /savatga qo'shish/i });
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();
    await expect(page.getByText(/savatga qo'shildi/i)).toBeVisible();

    // 2. Open Cart page and proceed to Checkout
    await page.goto("/uz/cart");
    const checkoutLink = page.getByRole("link", { name: /buyurtma berishga o'tish/i });
    await expect(checkoutLink).toBeVisible();
    await checkoutLink.click();

    await page.waitForURL("**/uz/checkout");
    await expect(page.locator("h1")).toContainText(/Buyurtmani rasmiylashtirish/i);

    // 3. Fill customer details
    await page.getByPlaceholder(/Jasur Alimov/i).fill("Rustam Qodirov");
    await page.getByPlaceholder("+998 90 123 45 67").fill("+998 90 123 45 67");

    // 4. Fill address details
    await page.getByPlaceholder(/Mirzo Ulug'bek tumani/i).fill("Chilonzor tumani");
    await page.getByPlaceholder(/Mustaqillik shoh ko'chasi/i).fill("Bunyodkor shoh ko'chasi, 42-uy");

    // 5. Submit order
    const confirmBtn = page.getByRole("button", { name: /buyurtmani tasdiqlash/i });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // 6. Verify redirected to success page
    await page.waitForURL("**/checkout/success*", { timeout: 15000 });
    expect(page.url()).toContain("checkout/success");

    // 7. Check OrderSuccessView elements
    const successTitle = page.locator("h1");
    await expect(successTitle).toBeVisible();

    const orderNumberBadge = page.locator("text=/Buyurtma raqami/i");
    await expect(orderNumberBadge).toBeVisible();

    const statusBadge = page.locator("text=/1C Buyurtma holati/i");
    await expect(statusBadge).toBeVisible();
  });
});
