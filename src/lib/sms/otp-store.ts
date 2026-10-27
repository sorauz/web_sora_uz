/**
 * Cryptographic OTP Store, Rate Limiter & Signed Challenge Manager
 *
 * Security Rules (from plan_sms_otp.md):
 * - 4-digit numeric OTP (1000 - 9999)
 * - Stored as HMAC-SHA256 hash (never plain text)
 * - TTL: 120 seconds (2 minutes)
 * - Resend Cooldown: 60 seconds
 * - Max Verify Attempts: 3 tries per OTP
 * - Rate Limit: Max 4 SMS / hour per phone, Max 10 SMS / hour per IP
 * - Serverless-Safe: Hybrid In-Memory + HMAC-Signed Cookie Challenge for Vercel
 */

import crypto from "crypto";

export const OTP_TTL_SECONDS = 120;
export const OTP_COOLDOWN_SECONDS = 60;
export const OTP_MAX_ATTEMPTS = 3;
export const MAX_SMS_PER_PHONE_HOUR = 4;
export const MAX_SMS_PER_IP_HOUR = 10;
export const VERIFIED_TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes to complete Step 3 (Name/INN)

interface OtpRecord {
  phone: string;
  codeHash: string;
  expiresAt: number;
  cooldownUntil: number;
  attempts: number;
}

interface RateLimitBucket {
  timestamps: number[];
}

export interface SignedOtpChallenge {
  phone: string;
  codeHash: string;
  expiresAt: number;
  cooldownUntil: number;
  attempts: number;
}

export interface VerifiedPhonePayload {
  phone: string;
  type: "B2C" | "B2B";
  inn?: string;
  exp: number;
}

const globalForOtp = globalThis as unknown as {
  __soraOtpMap?: Map<string, OtpRecord>;
  __soraPhoneRateMap?: Map<string, RateLimitBucket>;
  __soraIpRateMap?: Map<string, RateLimitBucket>;
};

const otpMap = globalForOtp.__soraOtpMap || new Map<string, OtpRecord>();
const phoneRateMap =
  globalForOtp.__soraPhoneRateMap || new Map<string, RateLimitBucket>();
const ipRateMap =
  globalForOtp.__soraIpRateMap || new Map<string, RateLimitBucket>();

globalForOtp.__soraOtpMap = otpMap;
globalForOtp.__soraPhoneRateMap = phoneRateMap;
globalForOtp.__soraIpRateMap = ipRateMap;

function getSecret(): string {
  return (
    process.env.OTP_SECRET_KEY ||
    process.env.SORA_API_PASSWORD ||
    "sora-uz-otp-hmac-secret-2026"
  );
}

/**
 * Generates a random 4-digit OTP code (1000 - 9999)
 */
export function generateOtpCode(): string {
  return crypto.randomInt(1000, 10000).toString();
}

/**
 * Computes HMAC-SHA256 hash of (phone + code)
 */
export function hashOtpCode(phone: string, code: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(`${phone}:${code.trim()}`)
    .digest("hex");
}

/**
 * Signs any JSON payload with HMAC-SHA256 for stateless serverless verification
 */
function signPayload(payload: object): string {
  const dataB64 = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(dataB64)
    .digest("base64url");
  return `${dataB64}.${sig}`;
}

/**
 * Verifies and decodes an HMAC-signed token
 */
function verifySignedPayload<T>(token: string | undefined): T | null {
  if (!token || !token.includes(".")) return null;
  const [dataB64, sig] = token.split(".");
  if (!dataB64 || !sig) return null;

  const expectedSig = crypto
    .createHmac("sha256", getSecret())
    .update(dataB64)
    .digest("base64url");

  if (sig.length !== expectedSig.length) return null;
  const isValid = crypto.timingSafeEqual(
    Buffer.from(sig),
    Buffer.from(expectedSig)
  );
  if (!isValid) return null;

  try {
    return JSON.parse(Buffer.from(dataB64, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

/**
 * Checks hourly rate limits and 60s cooldown before sending an SMS
 */
export function checkOtpRateLimit(
  phone: string,
  ip: string,
  existingCookieToken?: string
): {
  allowed: boolean;
  retryAfterSeconds?: number;
  reason?: "cooldown" | "phone_limit" | "ip_limit";
} {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  // 1. Check 60s cooldown from memory or signed cookie
  const memRecord = otpMap.get(phone);
  const cookieRecord = verifySignedPayload<SignedOtpChallenge>(
    existingCookieToken
  );

  const cooldownUntil = Math.max(
    memRecord?.cooldownUntil || 0,
    cookieRecord?.phone === phone ? cookieRecord.cooldownUntil : 0
  );

  if (now < cooldownUntil) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((cooldownUntil - now) / 1000),
      reason: "cooldown",
    };
  }

  // 2. Check Phone Hourly Limit (max 4 SMS / hour)
  const phoneBucket = phoneRateMap.get(phone) || { timestamps: [] };
  phoneBucket.timestamps = phoneBucket.timestamps.filter((t) => t > oneHourAgo);
  phoneRateMap.set(phone, phoneBucket);

  if (phoneBucket.timestamps.length >= MAX_SMS_PER_PHONE_HOUR) {
    const oldest = phoneBucket.timestamps[0] || now;
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((oldest + 3600_000 - now) / 1000),
      reason: "phone_limit",
    };
  }

  // 3. Check IP Hourly Limit (max 10 SMS / hour)
  if (ip && ip !== "unknown") {
    const ipBucket = ipRateMap.get(ip) || { timestamps: [] };
    ipBucket.timestamps = ipBucket.timestamps.filter((t) => t > oneHourAgo);
    ipRateMap.set(ip, ipBucket);

    if (ipBucket.timestamps.length >= MAX_SMS_PER_IP_HOUR) {
      const oldest = ipBucket.timestamps[0] || now;
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil((oldest + 3600_000 - now) / 1000),
        reason: "ip_limit",
      };
    }
  }

  return { allowed: true };
}

/**
 * Creates and stores a new OTP challenge for the given normalized phone
 */
export function createOtpChallenge(
  phone: string,
  code: string,
  ip: string
): {
  signedChallengeCookie: string;
  expiresIn: number;
  cooldown: number;
} {
  const now = Date.now();
  const expiresAt = now + OTP_TTL_SECONDS * 1000;
  const cooldownUntil = now + OTP_COOLDOWN_SECONDS * 1000;
  const codeHash = hashOtpCode(phone, code);

  const record: OtpRecord = {
    phone,
    codeHash,
    expiresAt,
    cooldownUntil,
    attempts: 0,
  };

  otpMap.set(phone, record);

  // Record rate-limit timestamp
  const phoneBucket = phoneRateMap.get(phone) || { timestamps: [] };
  phoneBucket.timestamps.push(now);
  phoneRateMap.set(phone, phoneBucket);

  if (ip && ip !== "unknown") {
    const ipBucket = ipRateMap.get(ip) || { timestamps: [] };
    ipBucket.timestamps.push(now);
    ipRateMap.set(ip, ipBucket);
  }

  const signedChallengeCookie = signPayload(record);

  return {
    signedChallengeCookie,
    expiresIn: OTP_TTL_SECONDS,
    cooldown: OTP_COOLDOWN_SECONDS,
  };
}

/**
 * Verifies user-submitted 4-digit OTP code
 */
export function verifyOtpChallenge(
  phone: string,
  code: string,
  cookieToken?: string
): {
  valid: boolean;
  reason?: "not_found" | "expired" | "max_attempts" | "invalid_code";
  remainingAttempts?: number;
  updatedCookieToken?: string;
} {
  const now = Date.now();
  const memRecord = otpMap.get(phone);
  const cookieRecord = verifySignedPayload<SignedOtpChallenge>(cookieToken);

  const activeRecord: OtpRecord | null =
    memRecord ||
    (cookieRecord && cookieRecord.phone === phone ? cookieRecord : null);

  if (!activeRecord) {
    return { valid: false, reason: "not_found" };
  }

  if (now > activeRecord.expiresAt) {
    otpMap.delete(phone);
    return { valid: false, reason: "expired" };
  }

  if (activeRecord.attempts >= OTP_MAX_ATTEMPTS) {
    otpMap.delete(phone);
    return { valid: false, reason: "max_attempts", remainingAttempts: 0 };
  }

  const candidateHash = hashOtpCode(phone, code);
  const isMatch =
    candidateHash.length === activeRecord.codeHash.length &&
    crypto.timingSafeEqual(
      Buffer.from(candidateHash),
      Buffer.from(activeRecord.codeHash)
    );

  if (!isMatch) {
    activeRecord.attempts += 1;
    const remaining = Math.max(0, OTP_MAX_ATTEMPTS - activeRecord.attempts);

    if (remaining === 0) {
      otpMap.delete(phone);
      return {
        valid: false,
        reason: "max_attempts",
        remainingAttempts: 0,
      };
    }

    otpMap.set(phone, activeRecord);
    return {
      valid: false,
      reason: "invalid_code",
      remainingAttempts: remaining,
      updatedCookieToken: signPayload(activeRecord),
    };
  }

  // Success! Consume and delete the OTP so it cannot be replayed
  otpMap.delete(phone);
  return { valid: true };
}

/**
 * Creates a short-lived signed token proving phone ownership for Step 3 (New User Registration)
 */
export function createVerifiedPhoneToken(
  phone: string,
  type: "B2C" | "B2B",
  inn?: string
): string {
  const payload: VerifiedPhonePayload = {
    phone,
    type,
    inn,
    exp: Date.now() + VERIFIED_TOKEN_TTL_MS,
  };
  return signPayload(payload);
}

/**
 * Verifies the short-lived token when completing new user registration (Step 3)
 */
export function verifyPhoneToken(token: string): VerifiedPhonePayload | null {
  const decoded = verifySignedPayload<VerifiedPhonePayload>(token);
  if (!decoded) return null;
  if (Date.now() > decoded.exp) return null;
  return decoded;
}
