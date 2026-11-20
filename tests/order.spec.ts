import { test, expect } from "@playwright/test";
import {
  OneCOrderDetailResponseSchema,
  OneCOrderHistoryResponseSchema,
  OneCOrderRequestSchema,
  OneCOrderResponseSchema,
} from "../src/lib/schemas/order";
import {
  createRecentOrderAccessToken,
  createSessionToken,
  parseRecentOrderAccessToken,
  parseSessionToken,
} from "../src/lib/auth/session-token";
import {
  formatOrderDate,
  getOrderStatusUiMeta,
  getTimelineStepLabel,
  normalizeOrderStatus,
} from "../src/lib/utils/order-status";
import {
  buildOneCOrderPayload,
  formatOneCOrderComment,
} from "../src/lib/utils/order-payload";
import {
  formatInnInput,
  formatOptionalUzPhoneInput,
  formatUzPhoneInput,
  isValidUzPhone,
} from "../src/lib/utils/phone";

test.describe("Checkout Validation, Phone Masking, Mandatory SMS OTP & 1C Order Flow", () => {
  test("1. Phone & INN helpers strip letters, cap lengths, and build clean B2B 1C payloads", () => {
    expect(formatUzPhoneInput("abc+998 90 123456789999")).toBe("+998 90 123-45-67");
    expect(formatUzPhoneInput("901234567")).toBe("+998 90 123-45-67");
    expect(formatUzPhoneInput("letters only!@#")).toBe("+998 ");
    expect(formatOptionalUzPhoneInput("abc")).toBe("");
    expect(formatOptionalUzPhoneInput("9911122334455")).toBe("+998 99 111-22-33");
    expect(formatInnInput("204abc393073999")).toBe("204393073");

    expect(isValidUzPhone("+998 90 123-45-67")).toBe(true);
    expect(isValidUzPhone("+998 90 123")).toBe(false);
    expect(isValidUzPhone("abcdefghi")).toBe(false);

    const b2bPayload = buildOneCOrderPayload({
      data: {
        customerType: "B2B",
        fullName: "Olim Shokirov",
        phone: "+998 90 326-54-58",
        altPhone: "+998 99 111-22-33",
        deliveryMethod: "courier",
        address: "Toshkent, Chilonzor 5-mavze",
        orderComment: "Ishonchnoma tayyor, ".repeat(25),
        paymentMethod: "b2b",
        companyName: "OOO TEST HOLDING",
        companyInn: "204393073",
        geolocation: "https://maps.google.com/maps?q=41.3,69.2",
        items: [
          {
            id: "65896d54-94da-11e9-8074-d43d7e011714",
            name: "Deli 0316 Stepler",
            price: 55000,
            quantity: 5,
          },
        ],
      },
      contactId: "79d1f6cb-3178-11e8-812c-d43d7e011714",
      clientId: "03671895-6f67-11ef-b458-5811229bddba",
      cleanPhone: "+998903265458",
      cleanAltPhone: "+998991112233",
    });

    expect(b2bPayload.type).toBe("B2B");
    expect(b2bPayload.contact_id).toBe("79d1f6cb-3178-11e8-812c-d43d7e011714");
    expect(b2bPayload.client_id).toBe("03671895-6f67-11ef-b458-5811229bddba");
    expect(
      b2bPayload.comment.startsWith(
        "Aloqa: Olim Shokirov, +998903265458 / +998991112233"
      )
    ).toBe(true);
    expect(b2bPayload.comment.length).toBeLessThanOrEqual(350);

    const b2cComment = formatOneCOrderComment(
      {
        customerType: "B2C",
        fullName: "Alisher Navoiy",
        deliveryMethod: "pickup",
        orderComment: "Soat 17:00 da",
      },
      "+998901234567"
    );
    expect(b2cComment).toBe("Olib ketish (Samovyvoz). Izoh: Soat 17:00 da");
  });

  test("2. POST /api/order/create returns 400 on invalid phone, missing address, or empty items", async ({
    request,
  }) => {
    const emptyItemsRes = await request.post("/api/order/create", {
      data: {
        customerType: "B2C",
        fullName: "Test User",
        phone: "+998901234567",
        deliveryMethod: "pickup",
        paymentMethod: "cash",
        items: [],
      },
    });
    expect(emptyItemsRes.status()).toBe(400);

    const badPhoneRes = await request.post("/api/order/create", {
      data: {
        customerType: "B2C",
        fullName: "Test User",
        phone: "+998 abc 123",
        deliveryMethod: "pickup",
        paymentMethod: "cash",
        items: [
          {
            id: "65896d54-94da-11e9-8074-d43d7e011714",
            name: "Deli 0316 Stepler",
            price: 55000,
            quantity: 1,
          },
        ],
      },
    });
    expect(badPhoneRes.status()).toBe(400);

    const missingAddressRes = await request.post("/api/order/create", {
      data: {
        customerType: "B2C",
        fullName: "Test User",
        phone: "+998901234567",
        deliveryMethod: "courier",
        address: "",
        paymentMethod: "cash",
        items: [
          {
            id: "65896d54-94da-11e9-8074-d43d7e011714",
            name: "Deli 0316 Stepler",
            price: 55000,
            quantity: 1,
          },
        ],
      },
    });
    expect(missingAddressRes.status()).toBe(400);
  });

  test("3. POST /api/order/create blocks unverified SMS orders with 401 for BOTH B2C and B2B", async ({
    request,
  }) => {
    const b2cRes = await request.post("/api/order/create", {
      data: {
        customerType: "B2C",
        fullName: "Alisher Navoiy",
        phone: "+998901234567",
        deliveryMethod: "pickup",
        paymentMethod: "cash",
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
    expect(b2cRes.status()).toBe(401);
    const b2cBody = await b2cRes.json();
    expect(b2cBody.code).toBe("PHONE_VERIFICATION_REQUIRED");

    const b2bRes = await request.post("/api/order/create", {
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
    expect(b2bRes.status()).toBe(401);
    const b2bBody = await b2bRes.json();
    expect(b2bBody.code).toBe("PHONE_VERIFICATION_REQUIRED");
  });

  test("4. GET /api/order/status and GET /api/orders enforce GUID validation and mandatory HMAC session ownership", async ({
    request,
  }) => {
    const emptyRes = await request.get("/api/order/status");
    expect(emptyRes.status()).toBe(400);

    const invalidGuidRes = await request.get("/api/order/status?orderId=not-a-guid");
    expect(invalidGuidRes.status()).toBe(400);

    const testGuid = "e44c21a0-318a-11e8-812c-d43d7e011714";
    const unauthStatusRes = await request.get(
      `/api/order/status?orderId=${testGuid}`
    );
    expect(unauthStatusRes.status()).toBe(401);
    const unauthStatusBody = await unauthStatusRes.json();
    expect(unauthStatusBody.code).toBe("AUTH_REQUIRED");

    const unauthHistoryRes = await request.get("/api/orders");
    expect(unauthHistoryRes.status()).toBe(401);
    const unauthHistoryBody = await unauthHistoryRes.json();
    expect(unauthHistoryBody.code).toBe("AUTH_REQUIRED");

    // Verify forged unsigned JSON cookie is rejected with 401
    const forgedCookie = encodeURIComponent(
      JSON.stringify({ id: "11112222-3333-4444-5555-666677778888", name: "Fake", type: "B2C" })
    );
    const tamperedOrdersRes = await request.get("/api/orders", {
      headers: {
        Cookie: `sora_session=${forgedCookie}`,
      },
    });
    expect(tamperedOrdersRes.status()).toBe(401);
  });

  test("5. Checkout UI enforces phone/INN masking, shows inline field errors with auto-focus, and requires SMS OTP", async ({
    page,
  }) => {
    // 1. Add item to cart and open Checkout
    await page.goto("/uz/products/deli-e1589-12-raqamli-kalkulyator-yashil");
    const addToCartBtn = page.getByRole("button", { name: /savatga qo'shish/i });
    await expect(addToCartBtn).toBeVisible();
    await addToCartBtn.click();
    await expect(page.getByText(/savatga qo'shildi/i)).toBeVisible();

    await page.goto("/uz/checkout");
    await expect(page.locator("h1")).toContainText(/Buyurtmani rasmiylashtirish/i);

    // 2. Phone masking rejects letters & caps at 9 local digits
    const phoneInput = page.getByPlaceholder("+998 90 123 45 67");
    await phoneInput.fill("abc+998 90 123456789999xyz");
    await expect(phoneInput).toHaveValue("+998 90 123-45-67");

    // Verify SMS verification prompt & button are shown for unauthenticated phone
    await expect(page.getByText(/SMS tasdiqlash talab etiladi/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /SMS kod olish/i })).toBeEnabled();

    // 3. Switch to B2B and verify INN rejects letters & caps at 9 digits
    await page.getByRole("button", { name: /Tashkilot nomidan \(B2B\)/i }).click();
    const innInput = page.getByPlaceholder("204393073").first();
    await innInput.fill("204abc393073999");
    await expect(innInput).toHaveValue("204393073");

    // 4. Submit with missing required fields (companyName, fullName, address)
    const confirmBtn = page.getByRole("button", { name: /buyurtmani tasdiqlash/i });
    await confirmBtn.click();

    // Should highlight each missing field with inline alert and focus the first one
    await expect(page.getByText(/Tashkilot nomini kiriting/i)).toBeVisible();
    await expect(page.getByText(/Ism-sharifingizni kiriting/i)).toBeVisible();
    await expect(page.getByText(/Yetkazib berish manzilini kiriting/i)).toBeVisible();

    const companyNameInput = page.getByPlaceholder(/Navruz International/i).first();
    await expect(companyNameInput).toBeFocused();
    expect(page.url()).toContain("/uz/checkout");
  });

  test("6. New 1C POST /order schemas & unified status helpers support CONFIRMED (posted: true), PENDING (posted: false), and legacy statuses", () => {
    const confirmed = OneCOrderResponseSchema.parse({
      message: "Buyurtma muvaffaqiyatli qabul qilindi",
      status_code: "CONFIRMED",
      status: "Qabul qilindi / Tasdiqlandi",
      posted: true,
      order_number: "0000-001425",
      order_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      total_amount: 450000,
    });
    expect(confirmed.posted).toBe(true);
    expect(confirmed.status_code).toBe("CONFIRMED");
    expect(confirmed.total_amount).toBe(450000);

    const pendingDraft = OneCOrderResponseSchema.parse({
      message: "Buyurtma qabul qilindi va menejer tekshiruviga yuborildi",
      status_code: "PENDING",
      status: "Tekshirilmoqda",
      posted: false,
      order_number: "0000-001426",
      order_id: "f1e2d3c4-b5a6-7890-abcd-ef1234567890",
      total_amount: 450000.25,
    });
    expect(pendingDraft.posted).toBe(false);
    expect(pendingDraft.status_code).toBe("PENDING");
    expect(pendingDraft.total_amount).toBe(450000.25);

    const legacyMinimal = OneCOrderResponseSchema.parse({
      order_number: "0000-001400",
      order_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    });
    expect(legacyMinimal.order_number).toBe("0000-001400");

    // Request validation rejects quantity <= 0 and negative price
    expect(
      OneCOrderRequestSchema.safeParse({
        type: "B2C",
        contact_id: "11112222-3333-4444-5555-666677778888",
        without_delivery: true,
        products: [{ product_id: "prod-1", quantity: 0, price: 1000 }],
      }).success
    ).toBe(false);

    expect(
      OneCOrderRequestSchema.safeParse({
        type: "B2C",
        contact_id: "11112222-3333-4444-5555-666677778888",
        without_delivery: true,
        products: [{ product_id: "prod-1", quantity: 2, price: -50 }],
      }).success
    ).toBe(false);

    // Unified status normalization & UZ/RU UI metadata
    expect(normalizeOrderStatus({ statusCode: "CONFIRMED", posted: true })).toBe("CONFIRMED");
    expect(normalizeOrderStatus({ statusCode: "PENDING", posted: false })).toBe("PENDING");
    expect(normalizeOrderStatus({ statusCode: "CANCELLED" })).toBe("CANCELLED");
    expect(normalizeOrderStatus({ statusText: "Tasdiqlangan" })).toBe("CONFIRMED");
    expect(normalizeOrderStatus({ statusText: "Jarayonda" })).toBe("PENDING");
    expect(normalizeOrderStatus({ statusText: "Bekor qilingan" })).toBe("CANCELLED");

    const pendingUz = getOrderStatusUiMeta(
      { statusCode: "PENDING", posted: false },
      "uz"
    );
    expect(pendingUz.isPending).toBe(true);
    expect(pendingUz.tone).toBe("amber");

    const confirmedRu = getOrderStatusUiMeta(
      { statusCode: "CONFIRMED", posted: true },
      "ru"
    );
    expect(confirmedRu.isConfirmedLike).toBe(true);
    expect(confirmedRu.tone).toBe("emerald");
    expect(confirmedRu.label).toContain("Подтверждён");
  });

  test("7. POST /api/order/create returns 400 on negative price or zero quantity", async ({
    request,
  }) => {
    const negPriceRes = await request.post("/api/order/create", {
      data: {
        customerType: "B2C",
        fullName: "Test User",
        phone: "+998901234567",
        deliveryMethod: "pickup",
        paymentMethod: "cash",
        items: [
          {
            id: "65896d54-94da-11e9-8074-d43d7e011714",
            name: "Deli 0316 Stepler",
            price: -100,
            quantity: 1,
          },
        ],
      },
    });
    expect(negPriceRes.status()).toBe(400);

    const zeroQtyRes = await request.post("/api/order/create", {
      data: {
        customerType: "B2C",
        fullName: "Test User",
        phone: "+998901234567",
        deliveryMethod: "pickup",
        paymentMethod: "cash",
        items: [
          {
            id: "65896d54-94da-11e9-8074-d43d7e011714",
            name: "Deli 0316 Stepler",
            price: 55000,
            quantity: 0,
          },
        ],
      },
    });
    expect(zeroQtyRes.status()).toBe(400);
  });

  test("8. OrderSuccessView renders PENDING (posted: false) draft reassurance and 1C total_amount without retrying", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "sora_last_order",
        JSON.stringify({
          orderId: "f1e2d3c4-b5a6-7890-abcd-ef1234567890",
          orderNumber: "0000-001426",
          createdAt: "2026-11-20T10:00:00.000Z",
          statusCode: "PENDING",
          statusText: "Tekshirilmoqda",
          posted: false,
          serverMessage: "Buyurtma qabul qilindi va menejer tekshiruviga yuborildi",
          fullName: "Alisher Valiyev",
          phone: "+998901234567",
          deliveryMethod: "pickup",
          paymentMethod: "cash",
          subtotal: 450000,
          totalAmount1C: 450000,
          deliveryFee: 0,
          total: 450000,
        })
      );
    });

    await page.route("**/api/order/status**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          order: {
            order_id: "f1e2d3c4-b5a6-7890-abcd-ef1234567890",
            order_number: "0000-001426",
            order_date: "2026-11-20T10:00:00",
            online: true,
            online_date: null,
            payment_type: "CASH_OR_CARD",
            status_code: "PENDING",
            status: "Tekshirilmoqda",
            posted: false,
            total_amount: 450000,
            comment: "",
            delivery: {
              without_delivery: true,
              geolocation: null,
              pickup_point: "Toshkent sh., Olmazor tumani, Dilsaroy 1",
            },
            timeline: [
              { code: "CONFIRMED", title: "Qabul qilindi / Tasdiqlandi", completed: false, date: null },
              { code: "ASSEMBLED", title: "Olib ketishga tayyor", completed: false, date: null },
              { code: "READY_FOR_PICKUP", title: "Topshirishga tayyor", completed: false, date: null },
              { code: "DELIVERED", title: "Mijozga topshirildi", completed: false, date: null },
            ],
            products: [],
          },
        }),
      });
    });

    await page.goto(
      "/uz/checkout/success?orderId=f1e2d3c4-b5a6-7890-abcd-ef1234567890&orderNumber=0000-001426"
    );

    await expect(page.getByText(/0000-001426/)).toBeVisible();
    await expect(
      page.getByText(/Qabul qilindi — menejer tekshiruvida/i)
    ).toBeVisible();
    await expect(
      page.getByText(/qayta buyurtma berish shart emas/i)
    ).toBeVisible();
    await expect(page.getByText(/Toshkent sh., Olmazor tumani, Dilsaroy 1/)).toBeVisible();
    await expect(page.getByText(/450\s*000/).first()).toBeVisible();
  });

  test("9. GET /order Mode 1 & Mode 2 schemas, 7 status codes (UZ/RU delivery vs pickup), timeline labels, and HMAC session signing", () => {
    // 1. Mode 1 Detail schema with nested delivery.without_delivery and null fields
    const detail = OneCOrderDetailResponseSchema.parse({
      order_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      order_number: "0000-001425",
      order_date: null,
      online: true,
      online_date: null,
      payment_type: "TRANSFER",
      status_code: "ASSEMBLED",
      status: "Olib ketishga tayyor",
      total_amount: 450000,
      comment: "",
      delivery: {
        without_delivery: true,
        geolocation: null,
        pickup_point: "Sora Do'kon",
      },
      customer: {
        type: "B2B",
        client_id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        client_name: "OOO TEST",
        contact: null,
      },
      timeline: [
        { code: "CONFIRMED", title: "Qabul qilindi / Tasdiqlandi", completed: true, date: null },
        { code: "ASSEMBLED", title: "Olib ketishga tayyor", completed: true, date: "2026-11-20T09:42:05" },
        { code: "READY_FOR_PICKUP", title: "Topshirishga tayyor", completed: false, date: null },
        { code: "DELIVERED", title: "Mijozga topshirildi", completed: false, date: null },
      ],
      products: [
        {
          line_number: 1,
          product_id: "99998888-7777-6666-5555-444433332222",
          product_name: "Kabel UTP Cat6",
          unit: "m",
          quantity: 100,
          price: 4500,
          amount: 450000,
        },
      ],
    });
    expect(detail.delivery.without_delivery).toBe(true);
    expect(detail.customer?.contact).toBeNull();
    expect(detail.timeline[0].date).toBeNull();
    expect(detail.products).toHaveLength(1);

    // 2. Mode 2 History schema with root without_delivery
    const history = OneCOrderHistoryResponseSchema.parse({
      limit: 20,
      offset: 0,
      has_more: true,
      orders: [
        {
          order_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          order_number: "0000-001425",
          order_date: "2026-11-20T09:15:00",
          online: false,
          status_code: "DELIVERED",
          status: "Yetkazib berildi",
          without_delivery: false,
          total_amount: 450000,
          items_count: 3,
        },
      ],
    });
    expect(history.has_more).toBe(true);
    expect(history.orders[0].without_delivery).toBe(false);

    // 3. All 7 status codes with delivery vs pickup differentiation in UZ & RU
    expect(
      getOrderStatusUiMeta({ statusCode: "ASSEMBLED", withoutDelivery: false }, "uz").label
    ).toBe("Omborda yig'ildi");
    expect(
      getOrderStatusUiMeta({ statusCode: "ASSEMBLED", withoutDelivery: true }, "uz").label
    ).toBe("Olib ketishga tayyor");
    expect(
      getOrderStatusUiMeta({ statusCode: "ASSEMBLED", withoutDelivery: true }, "ru").label
    ).toBe("Готов к выдаче");
    expect(
      getOrderStatusUiMeta({ statusCode: "SHIPPED" }, "ru").label
    ).toBe("Передан курьеру / В пути");
    expect(
      getOrderStatusUiMeta({ statusCode: "READY_FOR_PICKUP", withoutDelivery: true }, "ru").label
    ).toBe("Готов к самовывозу");
    expect(
      getOrderStatusUiMeta({ statusCode: "DELIVERED", withoutDelivery: true }, "ru").label
    ).toBe("Выдан клиенту");
    expect(
      getTimelineStepLabel("SHIPPED", { locale: "ru", withoutDelivery: false, fallbackTitle: "Kuryerga topshirildi" })
    ).toBe("Передан курьеру / В пути");
    expect(formatOrderDate(null, "uz")).toBe("");

    // 4. HMAC-signed session token verification rejects tampering and legacy plain JSON
    const sessionToken = createSessionToken({
      id: "11112222-3333-4444-5555-666677778888",
      name: "Alisher",
      type: "B2C",
      phone: "+998901234567",
    });
    expect(parseSessionToken(sessionToken)?.id).toBe("11112222-3333-4444-5555-666677778888");
    expect(parseSessionToken(`${sessionToken}tampered`)).toBeNull();
    expect(parseSessionToken(JSON.stringify({ id: "fake", name: "x", type: "B2C" }))).toBeNull();

    const accessToken = createRecentOrderAccessToken({
      orderId: "ord-1",
      type: "B2B",
      ownerId: "client-1",
    });
    expect(parseRecentOrderAccessToken(accessToken)?.ownerId).toBe("client-1");
    expect(parseRecentOrderAccessToken(`${accessToken}x`)).toBeNull();
  });

  test("10. /uz/orders renders auth prompt for guests in UZ and RU", async ({
    page,
  }) => {
    await page.goto("/uz/orders");
    await expect(
      page.getByRole("heading", { name: /Buyurtmalar tarixini ko'rish uchun tizimga kiring/i })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Tizimga kirish/i })).toBeVisible();

    await page.goto("/ru/orders");
    await expect(
      page.getByRole("heading", { name: /Войдите, чтобы увидеть историю заказов/i })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Войти в аккаунт/i })).toBeVisible();
  });
});
