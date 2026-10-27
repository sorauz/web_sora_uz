import { z } from "zod";

/**
 * Normalizes phone numbers to standard international format (+998XXXXXXXXX)
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+998")) return digits;
  if (digits.startsWith("998")) return `+${digits}`;
  if (digits.startsWith("8") && digits.length === 10) return `+998${digits.slice(1)}`;
  if (!digits.startsWith("+") && digits.length === 9) return `+998${digits}`;
  return digits;
}

/**
 * Login Schema (Legacy password or identifier lookup)
 */
export const LoginInputSchema = z
  .object({
    type: z.enum(["B2C", "B2B"]).default("B2C"),
    phone: z.string().optional(),
    inn: z.string().optional(),
    password: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "B2C") {
        return !!data.phone && data.phone.trim().length >= 9;
      }
      return !!data.inn && data.inn.trim().length >= 9;
    },
    {
      message: "Telefon raqami yoki INN to'liq kiritilishi shart",
      path: ["phone"],
    }
  );

export type LoginInput = z.infer<typeof LoginInputSchema>;

/**
 * Registration Schema:
 * Supports both passwordless (OTP) and legacy password registration
 */
export const RegisterInputSchema = z.object({
  type: z.enum(["B2C", "B2B"]).default("B2C"),
  name: z.string().min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak"),
  phone1: z.string().min(9, "Telefon raqami kiritilishi shart"),
  phone2: z.string().optional(),
  inn: z.string().optional(),
  password: z.string().optional(),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;

/**
 * SMS OTP Step 1: Send OTP Code
 */
export const OtpSendInputSchema = z.object({
  phone: z.string().min(9, "Telefon raqami kiritilishi shart"),
  type: z.enum(["B2C", "B2B"]).default("B2C"),
  inn: z.string().optional(),
  locale: z.enum(["uz", "ru"]).default("uz"),
});

export type OtpSendInput = z.infer<typeof OtpSendInputSchema>;

/**
 * SMS OTP Step 2: Verify 4-digit OTP Code
 */
export const OtpVerifyInputSchema = z.object({
  phone: z.string().min(9, "Telefon raqami kiritilishi shart"),
  code: z.string().regex(/^\d{4}$/, "Tasdiqlash kodi 4 ta raqamdan iborat bo'lishi kerak"),
  type: z.enum(["B2C", "B2B"]).default("B2C"),
  inn: z.string().optional(),
  locale: z.enum(["uz", "ru"]).default("uz"),
});

export type OtpVerifyInput = z.infer<typeof OtpVerifyInputSchema>;

/**
 * SMS OTP Step 3: Complete New Customer Registration in 1C ERP
 */
export const OtpCompleteInputSchema = z
  .object({
    verifiedToken: z.string().min(10, "Tasdiqlash tokeni topilmadi"),
    name: z.string().min(2, "Ism-sharif yoki tashkilot nomi kamida 2 ta belgidan iborat bo'lishi kerak"),
    type: z.enum(["B2C", "B2B"]).default("B2C"),
    inn: z.string().optional(),
    phone2: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "B2B") {
        return !!data.inn && /^\d{9}$/.test(data.inn.trim());
      }
      return true;
    },
    {
      message: "Tashkilotning 9 xonali STIR (INN) raqami kiritilishi shart",
      path: ["inn"],
    }
  );

export type OtpCompleteInput = z.infer<typeof OtpCompleteInputSchema>;

/**
 * User Session representation stored in encrypted cookie / state
 */
export const AuthUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["B2C", "B2B"]),
  phone: z.string().optional(),
  inn: z.string().optional(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

/**
 * 1C API Responses
 */
export const OneCUserResponseSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  type: z.string().default("B2C"),
});

export type OneCUserResponse = z.infer<typeof OneCUserResponseSchema>;
