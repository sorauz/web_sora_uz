import crypto from "crypto";
import { z } from "zod";
import { AuthUser, AuthUserSchema } from "@/lib/schemas/auth";

export const SESSION_COOKIE_NAME = "sora_session";
export const RECENT_ORDER_ACCESS_COOKIE_NAME = "sora_last_order_access";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
export const RECENT_ORDER_ACCESS_TTL_SECONDS = 60 * 60 * 24; // 24 hours

const RecentOrderAccessSchema = z.object({
  orderId: z.string().min(1),
  type: z.enum(["B2C", "B2B"]),
  ownerId: z.string().min(1),
  exp: z.number(),
});

export type RecentOrderAccess = z.infer<typeof RecentOrderAccessSchema>;

function getSessionSecret(): string {
  return (
    process.env.SESSION_SECRET_KEY ||
    process.env.OTP_SECRET_KEY ||
    process.env.SORA_API_PASSWORD ||
    "sora-uz-session-hmac-secret-2026"
  );
}

function signPayload(encodedPayload: string): string {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function signJson(payload: unknown): string {
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  return `${encoded}.${signPayload(encoded)}`;
}

function verifySignedJson(token?: string | null): unknown | null {
  if (!token) return null;
  const dotIdx = token.indexOf(".");
  if (dotIdx <= 0 || dotIdx !== token.lastIndexOf(".")) {
    return null;
  }

  const encoded = token.slice(0, dotIdx);
  const providedSig = token.slice(dotIdx + 1);
  if (!encoded || !providedSig) return null;

  const expectedSig = signPayload(encoded);
  const a = Buffer.from(providedSig, "utf8");
  const b = Buffer.from(expectedSig, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null;
  }

  try {
    const rawJson = Buffer.from(encoded, "base64url").toString("utf8");
    return JSON.parse(rawJson);
  } catch {
    return null;
  }
}

/**
 * Signs an `AuthUser` object with HMAC-SHA256 for storage in `sora_session`.
 */
export function createSessionToken(user: AuthUser): string {
  const validated = AuthUserSchema.parse(user);
  return signJson(validated);
}

/**
 * Verifies HMAC-SHA256 signature and validates `AuthUser` schema.
 * Rejects tampered or legacy unsigned JSON cookies.
 */
export function parseSessionToken(token?: string | null): AuthUser | null {
  const decoded = verifySignedJson(token);
  if (!decoded) return null;
  const parsed = AuthUserSchema.safeParse(decoded);
  return parsed.success ? parsed.data : null;
}

/**
 * Signs a short-lived order ownership receipt token for OrderSuccessView access.
 */
export function createRecentOrderAccessToken(params: {
  orderId: string;
  type: "B2C" | "B2B";
  ownerId: string;
}): string {
  const payload: RecentOrderAccess = {
    orderId: params.orderId,
    type: params.type,
    ownerId: params.ownerId,
    exp: Date.now() + RECENT_ORDER_ACCESS_TTL_SECONDS * 1000,
  };
  return signJson(payload);
}

/**
 * Verifies a recent order access token and rejects expired tokens.
 */
export function parseRecentOrderAccessToken(
  token?: string | null
): RecentOrderAccess | null {
  const decoded = verifySignedJson(token);
  if (!decoded) return null;
  const parsed = RecentOrderAccessSchema.safeParse(decoded);
  if (!parsed.success) return null;
  if (Date.now() > parsed.data.exp) return null;
  return parsed.data;
}
