import { test, expect } from "@playwright/test";
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

  test("4. GET /api/order/status requires orderId and returns order details or 404", async ({
    request,
  }) => {
    const emptyRes = await request.get("/api/order/status");
    expect(emptyRes.status()).toBe(400);

    const testGuid = "e44c21a0-318a-11e8-812c-d43d7e011714";
    const statusRes = await request.get(`/api/order/status?orderId=${testGuid}`);
    expect([200, 404]).toContain(statusRes.status());
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
});
