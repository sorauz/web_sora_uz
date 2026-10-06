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
 * Login Schema:
 * B2C uses phone + password
 * B2B uses INN + password
 */
export const LoginInputSchema = z
  .object({
    type: z.enum(["B2C", "B2B"]).default("B2C"),
    phone: z.string().optional(),
    inn: z.string().optional(),
    password: z.string().min(4, "Parol kamida 4 ta belgidan iborat bo'lishi kerak"),
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
 * Always defaults to B2C (Name, Phone, Password).
 * B2B can also be registered directly or during checkout.
 */
export const RegisterInputSchema = z.object({
  type: z.enum(["B2C", "B2B"]).default("B2C"),
  name: z.string().min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak"),
  phone1: z.string().min(9, "Telefon raqami kiritilishi shart"),
  phone2: z.string().optional(),
  inn: z.string().optional(),
  password: z.string().min(4, "Parol kamida 4 ta belgidan iborat bo'lishi kerak"),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;

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
