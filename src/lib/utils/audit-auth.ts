import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

export const AUDIT_COOKIE_NAME = "sora_audit_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export function getAuditAccessKey(): string {
  return (
    process.env.AUDIT_ACCESS_KEY ||
    process.env.REVALIDATION_SECRET ||
    "sora_audit_2026"
  );
}

/**
 * Constant-time secret comparison to prevent timing side-channel attacks.
 */
export function verifyAuditAccessKey(candidate?: string | null): boolean {
  if (!candidate) return false;
  const expected = getAuditAccessKey();
  const a = Buffer.from(candidate.trim(), "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function signPayload(payload: string): string {
  return crypto
    .createHmac("sha256", getAuditAccessKey())
    .update(payload)
    .digest("hex");
}

export function createAuditSessionToken(): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  const sig = signPayload(payload);
  return `${payload}.${sig}`;
}

export function verifyAuditSessionToken(token?: string | null): boolean {
  if (!token || !token.includes(".")) return false;
  const [payload, providedSig] = token.split(".");
  if (!payload || !providedSig) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  const expectedSig = signPayload(payload);
  const a = Buffer.from(providedSig, "utf8");
  const b = Buffer.from(expectedSig, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Checks whether the current request has a valid audit cookie or explicit access key.
 */
export async function isAuditRequestAuthorized(
  explicitKey?: string | null
): Promise<boolean> {
  if (verifyAuditAccessKey(explicitKey)) {
    return true;
  }
  const cookieStore = await cookies();
  const token = cookieStore.get(AUDIT_COOKIE_NAME)?.value;
  return verifyAuditSessionToken(token);
}
