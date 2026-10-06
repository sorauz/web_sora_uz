import { z } from "zod";

/**
 * Single product item in 1C order request
 */
export const OrderProductItemSchema = z.object({
  product_id: z.string().min(1, "Mahsulot ID (GUID) majburiy"),
  quantity: z.number().int().positive("Miqdor 1 yoki undan ortiq bo'lishi kerak"),
  price: z.number().nonnegative("Mahsulot narxi musbat bo'lishi kerak"),
});

export type OrderProductItem = z.infer<typeof OrderProductItemSchema>;

/**
 * 1C Order Creation Request Body
 * POST /SORA/hs/for_msp/order
 */
export const OneCOrderRequestSchema = z.object({
  type: z.enum(["B2C", "B2B"]),
  contact_id: z.string().min(1, "contact_id majburiy!"),
  client_id: z.string().optional(),
  without_delivery: z.boolean(),
  geolocation: z.string().max(150).optional().default(""),
  comment: z.string().max(350).optional().default(""),
  products: z.array(OrderProductItemSchema).min(1, "Savatcha bo'sh! 'products' massivi yuborilmadi."),
}).refine(
  (data) => {
    if (data.type === "B2B") {
      return !!data.client_id && data.client_id.trim().length > 0;
    }
    return true;
  },
  {
    message: "B2B buyurtma uchun 'client_id' majburiy!",
    path: ["client_id"],
  }
);

export type OneCOrderRequest = z.infer<typeof OneCOrderRequestSchema>;

/**
 * 1C Order Creation Response
 * 201 Created
 */
export const OneCOrderResponseSchema = z.object({
  message: z.string().optional(),
  order_number: z.string(),
  order_id: z.string(),
});

export type OneCOrderResponse = z.infer<typeof OneCOrderResponseSchema>;

/**
 * 1C Order Status Response
 * GET /SORA/hs/for_msp/order?order_id={GUID} -> 200 OK
 */
export const OneCOrderStatusResponseSchema = z.object({
  order_id: z.string(),
  order_number: z.string(),
  order_date: z.string(),
  status: z.enum(["Tasdiqlangan", "Bekor qilingan", "Jarayonda"]).or(z.string()),
  without_delivery: z.boolean(),
  total_amount: z.number(),
});

export type OneCOrderStatusResponse = z.infer<typeof OneCOrderStatusResponseSchema>;

/**
 * Frontend Checkout payload sent to Next.js /api/order/create
 */
export const CheckoutCreateOrderInputSchema = z.object({
  customerType: z.enum(["B2C", "B2B"]).default("B2C"),
  fullName: z.string().min(2, "Ism-sharif kamida 2 ta harfdan iborat bo'lishi kerak"),
  phone: z.string().min(9, "Telefon raqami kiritilishi shart"),
  altPhone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  deliveryMethod: z.enum(["courier", "pickup"]),
  region: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  landmark: z.string().optional(),
  orderComment: z.string().optional(),
  paymentMethod: z.string(),
  companyName: z.string().optional(),
  companyInn: z.string().optional(),
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number().int().positive(),
      picture: z.string().optional(),
    })
  ).min(1, "Savatcha bo'sh!"),
});

export type CheckoutCreateOrderInput = z.infer<typeof CheckoutCreateOrderInputSchema>;
