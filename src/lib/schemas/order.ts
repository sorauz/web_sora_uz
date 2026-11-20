import { z } from "zod";
import { isValidUzPhone } from "@/lib/utils/phone";

/**
 * Unified 1C Order Status Code
 * Standard codes shared across POST /order (CONFIRMED, PENDING) and GET /order.
 */
export const OrderStatusCodeSchema = z.enum([
  "CONFIRMED",
  "PENDING",
  "ASSEMBLED",
  "SHIPPED",
  "READY_FOR_PICKUP",
  "DELIVERED",
  "CANCELLED",
]);

export type OrderStatusCode = z.infer<typeof OrderStatusCodeSchema>;

/**
 * Single product item in 1C order request
 */
export const OrderProductItemSchema = z.object({
  product_id: z.string().min(1, "Mahsulot ID (GUID) majburiy"),
  quantity: z
    .number()
    .finite()
    .positive("Miqdor 0 dan katta son bo'lishi kerak"),
  price: z
    .number()
    .finite()
    .nonnegative("Mahsulot narxi manfiy bo'lishi mumkin emas"),
});

export type OrderProductItem = z.infer<typeof OrderProductItemSchema>;

/**
 * 1C Order Creation Request Body
 * POST /SORA/hs/for_msp/order
 */
export const OneCOrderRequestSchema = z.object({
  type: z.enum(["B2C", "B2B"]),
  contact_id: z.string().optional(),
  client_id: z.string().optional(),
  without_delivery: z.boolean(),
  geolocation: z.string().max(150).optional().default(""),
  comment: z.string().max(350).optional().default(""),
  products: z.array(OrderProductItemSchema).min(1, "Savatcha bo'sh! 'products' massivi yuborilmadi."),
}).refine(
  (data) => {
    if (data.type === "B2C") {
      return !!data.contact_id && data.contact_id.trim().length > 0;
    }
    if (data.type === "B2B") {
      return !!data.client_id && data.client_id.trim().length > 0;
    }
    return true;
  },
  {
    message: "B2C uchun 'contact_id', B2B uchun esa 'client_id' majburiy!",
  }
);

export type OneCOrderRequest = z.infer<typeof OneCOrderRequestSchema>;

/**
 * 1C Order Creation Response
 * 201 Created — supports both CONFIRMED (posted: true) and PENDING draft (posted: false)
 */
export const OneCOrderResponseSchema = z.object({
  message: z.string().optional(),
  order_number: z.string(),
  order_id: z.string(),
  status_code: OrderStatusCodeSchema.or(z.string()).optional(),
  status: z.string().optional(),
  posted: z.boolean().optional(),
  total_amount: z.number().finite().nonnegative().optional(),
});

export type OneCOrderResponse = z.infer<typeof OneCOrderResponseSchema>;

export const OrderPaymentTypeSchema = z
  .enum(["TRANSFER", "CASH_OR_CARD"])
  .or(z.string());

export type OrderPaymentType = z.infer<typeof OrderPaymentTypeSchema>;

export const OneCOrderDeliverySchema = z.object({
  without_delivery: z.boolean(),
  geolocation: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  pickup_point: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
});

export type OneCOrderDelivery = z.infer<typeof OneCOrderDeliverySchema>;

export const OneCOrderCustomerContactSchema = z.object({
  contact_id: z.string(),
  name: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? ""),
  phone_1: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  phone_2: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  tg_username: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
});

export type OneCOrderCustomerContact = z.infer<
  typeof OneCOrderCustomerContactSchema
>;

export const OneCOrderCustomerSchema = z.object({
  type: z.enum(["B2B", "B2C"]).or(z.string()),
  client_id: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  client_name: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  contact: OneCOrderCustomerContactSchema.nullable()
    .optional()
    .transform((v) => v ?? null),
});

export type OneCOrderCustomer = z.infer<typeof OneCOrderCustomerSchema>;

export const OneCOrderTimelineStepSchema = z.object({
  code: OrderStatusCodeSchema.or(z.string()),
  title: z.string().default(""),
  completed: z.boolean().default(false),
  date: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
});

export type OneCOrderTimelineStep = z.infer<typeof OneCOrderTimelineStepSchema>;

export const OneCOrderProductLineSchema = z.object({
  line_number: z.number(),
  product_id: z.string(),
  product_name: z.string(),
  unit: z.string().default(""),
  quantity: z.number(),
  price: z.number(),
  amount: z.number(),
});

export type OneCOrderProductLine = z.infer<typeof OneCOrderProductLineSchema>;

/**
 * 1C Order Detail Response (Mode 1)
 * GET /SORA/hs/for_msp/order?order_id={GUID}&type=... -> 200 OK
 */
export const OneCOrderDetailResponseSchema = z.object({
  order_id: z.string(),
  order_number: z.string(),
  order_date: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  online: z.boolean().optional().default(true),
  online_date: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  payment_type: OrderPaymentTypeSchema.optional().default("CASH_OR_CARD"),
  status_code: OrderStatusCodeSchema.or(z.string()).optional(),
  status: z.string().default(""),
  posted: z.boolean().optional(),
  total_amount: z.number().default(0),
  comment: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? ""),
  delivery: OneCOrderDeliverySchema,
  customer: OneCOrderCustomerSchema.optional(),
  timeline: z.array(OneCOrderTimelineStepSchema).default([]),
  products: z.array(OneCOrderProductLineSchema).default([]),
});

export type OneCOrderDetailResponse = z.infer<
  typeof OneCOrderDetailResponseSchema
>;

/**
 * 1C Order History List Item (Mode 2)
 * GET /SORA/hs/for_msp/order?type=... -> 200 OK
 */
export const OneCOrderHistoryItemSchema = z.object({
  order_id: z.string(),
  order_number: z.string(),
  order_date: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  online: z.boolean().optional().default(true),
  status_code: OrderStatusCodeSchema.or(z.string()).optional(),
  status: z.string().default(""),
  without_delivery: z.boolean().default(false),
  total_amount: z.number().default(0),
  items_count: z.number().int().nonnegative().default(0),
});

export type OneCOrderHistoryItem = z.infer<typeof OneCOrderHistoryItemSchema>;

export const OneCOrderHistoryResponseSchema = z.object({
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
  has_more: z.boolean(),
  orders: z.array(OneCOrderHistoryItemSchema).default([]),
});

export type OneCOrderHistoryResponse = z.infer<
  typeof OneCOrderHistoryResponseSchema
>;

/**
 * Frontend Checkout payload sent to Next.js /api/order/create
 */
export const CheckoutCreateOrderInputSchema = z
  .object({
    customerType: z.enum(["B2C", "B2B"]).default("B2C"),
    fullName: z
      .string()
      .trim()
      .min(2, "Ism-sharif kamida 2 ta harfdan iborat bo'lishi kerak"),
    phone: z
      .string()
      .refine(
        (val) => isValidUzPhone(val),
        "Telefon raqami to'liq kiritilishi shart (+998 XX XXX-XX-XX)"
      ),
    altPhone: z
      .string()
      .optional()
      .refine(
        (val) => !val || !val.trim() || isValidUzPhone(val),
        "Qo'shimcha telefon raqami to'liq kiritilishi shart (+998 XX XXX-XX-XX)"
      ),
    email: z.string().email().optional().or(z.literal("")),
    deliveryMethod: z.enum(["courier", "pickup"]),
    region: z.string().optional(),
    district: z.string().optional(),
    address: z.string().optional(),
    landmark: z.string().optional(),
    geolocation: z.string().max(150).optional().default(""),
    orderComment: z.string().optional(),
    paymentMethod: z.string(),
    companyName: z.string().optional(),
    companyInn: z.string().optional(),
    verifiedPhoneToken: z.string().optional(),
    items: z
      .array(
        z.object({
          id: z.string().min(1),
          name: z.string(),
          price: z
            .number()
            .finite()
            .nonnegative("Mahsulot narxi manfiy bo'lishi mumkin emas"),
          quantity: z.number().int().positive(),
          picture: z.string().optional(),
        })
      )
      .min(1, "Savatcha bo'sh!"),
  })
  .superRefine((data, ctx) => {
    if (data.customerType === "B2B") {
      if (!data.companyName || data.companyName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["companyName"],
          message: "Tashkilot nomi kiritilishi shart!",
        });
      }
      const cleanInn = (data.companyInn || "").replace(/\D/g, "");
      if (cleanInn.length !== 9) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["companyInn"],
          message: "Tashkilotning 9 xonali STIR (INN) raqami kiritilishi shart!",
        });
      }
    }
    if (
      data.deliveryMethod === "courier" &&
      (!data.address || data.address.trim().length < 3)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["address"],
        message: "Yetkazib berish manzilini kiriting!",
      });
    }
  });

export type CheckoutCreateOrderInput = z.infer<typeof CheckoutCreateOrderInputSchema>;
