/**
 * Google Merchant Center, Yandex Market, and Schema.org Product data hygiene helpers.
 * Guarantees valid GTIN checksums, clean MPN/SKU values, and cache-busted CDN image URLs.
 */

const DEFAULT_BASE_URL = "https://sora.uz";

/**
 * Floor image version matching the Nov 10, 2026 cdn.sora.uz 1500x1500px upgrade.
 * Forces Googlebot-Image and Merchant Center to bypass the 1-year `immutable` CDN cache
 * and re-crawl high-resolution 1500x1500 images immediately, while bumping automatically
 * whenever a product's 1C `updated_at` timestamp advances past this date.
 */
export const CDN_IMAGE_VERSION_FLOOR = "20261110";

const INVALID_MPN_VALUES = new Set([
  "",
  "n/a",
  "na",
  "null",
  "undefined",
  "none",
  "-",
  "—",
  "0",
  "0000",
]);

/**
 * Validates whether a barcode string conforms to GS1 GTIN-8, UPC-12, EAN-13, or GTIN-14
 * with a valid Modulo-10 check digit and excludes internal/placeholder codes.
 */
export function getValidGtin(barcode?: string | null): string | undefined {
  if (!barcode) return undefined;
  const code = barcode.trim();

  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(code)) {
    return undefined;
  }

  // Reject all-zeroes and GS1 variable-measure / in-store EAN-13 prefix (20-29)
  if (/^0+$/.test(code) || (code.length === 13 && code.startsWith("2"))) {
    return undefined;
  }

  const digits = code.split("").map(Number);
  const checkDigit = digits.pop()!;
  let sum = 0;

  for (let i = 0; i < digits.length; i++) {
    const digit = digits[digits.length - 1 - i];
    sum += digit * (i % 2 === 0 ? 3 : 1);
  }

  const expectedCheck = (10 - (sum % 10)) % 10;
  return expectedCheck === checkDigit ? code : undefined;
}

/**
 * Returns a clean MPN/SKU string or undefined if empty / placeholder ("N/A", "-", etc.).
 */
export function getValidMpn(sku?: string | null): string | undefined {
  if (!sku) return undefined;
  const trimmed = sku.trim();
  if (INVALID_MPN_VALUES.has(trimmed.toLowerCase())) {
    return undefined;
  }
  // Google Merchant limits MPN to 70 characters
  return trimmed.slice(0, 70);
}

/**
 * Computes a compact YYYYMMDD version string, floored at CDN_IMAGE_VERSION_FLOOR.
 */
function resolveImageVersion(updatedAt?: string): string {
  if (!updatedAt) return CDN_IMAGE_VERSION_FLOOR;

  const datePart = updatedAt.slice(0, 10).replace(/-/g, "");
  if (/^\d{8}$/.test(datePart) && datePart > CDN_IMAGE_VERSION_FLOOR) {
    return datePart;
  }
  return CDN_IMAGE_VERSION_FLOOR;
}

/**
 * Normalizes a product's main_picture URL for XML feeds, JSON-LD, OpenGraph, and Sitemaps.
 * - Uses fallbackUrl when main_picture is blank (prevents emitting bare "https://sora.uz")
 * - Appends `?v=YYYYMMDD` on `cdn.sora.uz` URLs so Merchant Center picks up upgraded 1500x1500 photos
 */
export function resolveProductImageUrl(
  rawPicture?: string | null,
  options?: {
    updatedAt?: string;
    baseUrl?: string;
    fallbackUrl?: string;
  }
): string {
  const baseUrl = options?.baseUrl ?? DEFAULT_BASE_URL;
  const fallback = options?.fallbackUrl ?? `${baseUrl}/og-image.jpg`;
  const trimmed = rawPicture?.trim();

  if (!trimmed) {
    return fallback;
  }

  const absoluteUrl = trimmed.startsWith("http")
    ? trimmed
    : `${baseUrl}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;

  try {
    const parsed = new URL(absoluteUrl);
    if (parsed.hostname === "cdn.sora.uz") {
      parsed.searchParams.set("v", resolveImageVersion(options?.updatedAt));
      return parsed.toString();
    }
    return parsed.toString();
  } catch {
    return absoluteUrl;
  }
}
