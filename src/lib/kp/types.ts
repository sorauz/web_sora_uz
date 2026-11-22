import type { KpVatMode } from "./calculations";

export interface KpDocumentItem {
  id: string;
  sku?: string;
  name: string;
  slug?: string;
  picture?: string;
  unit: string;
  quantity: number;
  price: number;
}

export interface KpDocumentCustomer {
  companyName: string;
  companyInn?: string | null;
  contactName?: string | null;
  phone?: string | null;
  bankAccount?: string | null;
  bankMfo?: string | null;
  legalAddress?: string | null;
}

export interface KpDocumentData {
  orderNumber: string;
  createdAtIso: string | null;
  validUntilIso: string | null;
  docLocale: "uz" | "ru";
  vatMode: KpVatMode;
  publicUrl: string;
  customer: KpDocumentCustomer;
  items: KpDocumentItem[];
  totalAmountOverride?: number;
}

export function formatKpDisplayDate(
  iso: string | null | undefined,
  locale: "uz" | "ru",
  includeTime = false
): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  if (!includeTime) return `${day}.${month}.${year}`;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return locale === "ru"
    ? `${day}.${month}.${year}, ${hh}:${mm}`
    : `${day}.${month}.${year} • ${hh}:${mm}`;
}

export function formatMoney(amount: number): string {
  return Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 30_000);
}
