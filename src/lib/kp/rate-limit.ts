import type { NextRequest } from "next/server";

export const MAX_KP_REQUESTS_PER_IP_HOUR = 80; // Within 60-90/hour specification

interface KpRateBucket {
  timestamps: number[];
}

const globalForKpRate = globalThis as unknown as {
  __soraKpIpRateMap?: Map<string, KpRateBucket>;
};

const kpIpRateMap =
  globalForKpRate.__soraKpIpRateMap || new Map<string, KpRateBucket>();
globalForKpRate.__soraKpIpRateMap = kpIpRateMap;

export function getRequestClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  return realIp || "unknown";
}

/**
 * Checks and records an IP-based hourly rate limit for KP endpoints
 * to prevent spam to 1C ERP and Telegram notification groups.
 */
export function checkAndRecordKpIpRateLimit(
  ip: string,
  maxPerHour = MAX_KP_REQUESTS_PER_IP_HOUR
): {
  allowed: boolean;
  retryAfterSeconds?: number;
  remaining: number;
} {
  if (!ip || ip === "unknown") {
    return { allowed: true, remaining: maxPerHour };
  }

  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const bucket = kpIpRateMap.get(ip) || { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((ts) => ts > oneHourAgo);

  if (bucket.timestamps.length >= maxPerHour) {
    const oldest = bucket.timestamps[0] || now;
    kpIpRateMap.set(ip, bucket);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + 3600_000 - now) / 1000)),
      remaining: 0,
    };
  }

  bucket.timestamps.push(now);
  kpIpRateMap.set(ip, bucket);
  return {
    allowed: true,
    remaining: Math.max(0, maxPerHour - bucket.timestamps.length),
  };
}
