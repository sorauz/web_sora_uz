import crypto from "crypto";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface KpPublicTokenPayload {
  orderId: string;
  clientId: string;
}

function getKpTokenSecret(): string {
  return (
    process.env.KP_TOKEN_SECRET ||
    process.env.SESSION_SECRET_KEY ||
    process.env.OTP_SECRET_KEY ||
    process.env.SORA_API_PASSWORD ||
    "sora-uz-session-hmac-secret-2026"
  );
}

function uuidToBytes(uuid: string): Buffer | null {
  const clean = uuid.trim();
  if (!UUID_RE.test(clean)) return null;
  return Buffer.from(clean.replace(/-/g, ""), "hex");
}

function bytesToUuid(buf: Buffer): string {
  const hex = buf.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Encodes (orderId, clientId) into a compact, tamper-proof HMAC-SHA256 signed token.
 * For standard 1C UUIDs, packs into 32 binary bytes + 16-byte MAC = exact 64 base64url chars.
 */
export function encodeKpPublicToken(payload: KpPublicTokenPayload): string {
  const orderId = payload.orderId.trim();
  const clientId = payload.clientId.trim();
  if (!orderId || !clientId) {
    throw new Error("orderId va clientId bo'sh bo'lishi mumkin emas");
  }

  const orderBytes = uuidToBytes(orderId);
  const clientBytes = uuidToBytes(clientId);
  const secret = getKpTokenSecret();

  if (orderBytes && clientBytes) {
    const body = Buffer.concat([orderBytes, clientBytes]); // 32 bytes
    const sig = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest()
      .subarray(0, 16); // 16 bytes
    return Buffer.concat([body, sig]).toString("base64url"); // 48 bytes -> 64 chars
  }

  // Fallback for non-UUID test fixtures
  const dataB64 = Buffer.from(
    JSON.stringify({ o: orderId, c: clientId }),
    "utf8"
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", secret)
    .update(`v2:${dataB64}`)
    .digest("base64url");
  return `v2.${dataB64}.${sig}`;
}

/**
 * Verifies the HMAC-SHA256 signature of a public KP token and extracts { orderId, clientId }.
 * Returns null for tampered, malformed, or invalid tokens.
 */
export function verifyKpPublicToken(
  token: string | null | undefined
): KpPublicTokenPayload | null {
  if (!token || typeof token !== "string") return null;
  const trimmed = token.trim();
  if (!trimmed) return null;

  const secret = getKpTokenSecret();

  if (trimmed.startsWith("v2.")) {
    const parts = trimmed.split(".");
    if (parts.length !== 3 || !parts[1] || !parts[2]) return null;
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(`v2:${parts[1]}`)
      .digest("base64url");
    const a = Buffer.from(parts[2], "utf8");
    const b = Buffer.from(expectedSig, "utf8");
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    try {
      const parsed = JSON.parse(
        Buffer.from(parts[1], "base64url").toString("utf8")
      ) as { o?: string; c?: string };
      if (!parsed.o || !parsed.c) return null;
      return { orderId: parsed.o, clientId: parsed.c };
    } catch {
      return null;
    }
  }

  // Compact 64-char binary UUID + HMAC format
  if (!/^[A-Za-z0-9_-]{64}$/.test(trimmed)) return null;
  let buf: Buffer;
  try {
    buf = Buffer.from(trimmed, "base64url");
  } catch {
    return null;
  }
  if (buf.length !== 48) return null;

  const body = buf.subarray(0, 32);
  const providedSig = buf.subarray(32, 48);
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest()
    .subarray(0, 16);

  if (!crypto.timingSafeEqual(providedSig, expectedSig)) {
    return null;
  }

  return {
    orderId: bytesToUuid(body.subarray(0, 16)),
    clientId: bytesToUuid(body.subarray(16, 32)),
  };
}
