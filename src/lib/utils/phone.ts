export const UZ_PHONE_REGEX = /^\+998\d{9}$/;

/**
 * Extracts normalized "+998XXXXXXXXX" from any raw Uzbek phone input string.
 */
export function normalizeUzPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("998") && digits.length >= 12) {
    return `+${digits.slice(0, 12)}`;
  }
  if (digits.startsWith("998")) {
    return `+${digits}`;
  }
  if (digits.startsWith("8") && digits.length === 10) {
    return `+998${digits.slice(1)}`;
  }
  if (digits.length === 9) {
    return `+998${digits}`;
  }
  return digits ? `+${digits}` : "";
}

/**
 * Checks whether the input contains a complete 9-digit Uzbek mobile/landline number (+998XXXXXXXXX).
 */
export function isValidUzPhone(raw: string): boolean {
  return UZ_PHONE_REGEX.test(normalizeUzPhone(raw));
}

function extractLocalUzDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("998")) {
    digits = digits.slice(3);
  } else if (digits.startsWith("8") && digits.length > 9) {
    digits = digits.slice(1);
  } else if (raw.trim() === "+99" || raw.trim() === "+9" || raw.trim() === "+") {
    digits = "";
  }
  return digits.slice(0, 9);
}

function formatFromLocalDigits(local: string): string {
  if (local.length === 0) return "+998 ";
  if (local.length <= 2) return `+998 ${local}`;
  if (local.length <= 5) return `+998 ${local.slice(0, 2)} ${local.slice(2)}`;
  if (local.length <= 7) {
    return `+998 ${local.slice(0, 2)} ${local.slice(2, 5)}-${local.slice(5)}`;
  }
  return `+998 ${local.slice(0, 2)} ${local.slice(2, 5)}-${local.slice(5, 7)}-${local.slice(7, 9)}`;
}

/**
 * Formats a required Uzbek phone field into "+998 XX XXX-XX-XX" (strictly digits only, max 9 local digits).
 */
export function formatUzPhoneInput(raw: string): string {
  const local = extractLocalUzDigits(raw);
  return formatFromLocalDigits(local);
}

/**
 * Formats an optional Uzbek phone field into "+998 XX XXX-XX-XX", returning "" when cleared.
 */
export function formatOptionalUzPhoneInput(raw: string): string {
  if (!raw.trim()) return "";
  const local = extractLocalUzDigits(raw);
  if (local.length === 0) return "";
  return formatFromLocalDigits(local);
}

/**
 * Sanitizes Uzbekistan company INN (STIR) to digits only, max 9 digits.
 */
export function formatInnInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 9);
}
