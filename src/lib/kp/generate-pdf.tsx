"use client";

import React from "react";
import {
  Document,
  Font,
  Image as PdfImage,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import { SORA_COMPANY_INFO } from "@/lib/config/company";
import { calculateKpTotals } from "./calculations";
import { generateKpQrDataUrl } from "./qrcode";
import {
  formatKpDisplayDate,
  formatMoney,
  triggerBrowserDownload,
  type KpDocumentData,
} from "./types";

let fontsRegistered = false;

function ensureRobotoFontsRegistered(): void {
  if (fontsRegistered) return;
  Font.register({
    family: "Roboto",
    fonts: [
      { src: "/fonts/Roboto-Regular.ttf", fontWeight: 400 },
      { src: "/fonts/Roboto-Bold.ttf", fontWeight: 700 },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

/**
 * Loads an image in the browser (supporting WebP/AVIF/PNG/JPG with Cloudflare R2 CORS)
 * and renders it to a compact PNG Data URL so @react-pdf/renderer never fails on WebP or broken links.
 */
async function resolvePdfSafeImageDataUrl(
  src?: string | null,
  size = 96
): Promise<string | null> {
  if (!src || typeof window === "undefined") return null;

  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    const timer = setTimeout(() => {
      resolve(null);
    }, 4000);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement("canvas");
        const w = img.naturalWidth || size;
        const h = img.naturalHeight || size;
        const scale = Math.min(1, size / Math.max(w, h));
        canvas.width = Math.max(1, Math.round(w * scale));
        canvas.height = Math.max(1, Math.round(h * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };

    img.src = src;
  });
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 8.5,
    paddingTop: 28,
    paddingBottom: 42,
    paddingHorizontal: 28,
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: "#0284c7",
    marginBottom: 12,
  },
  brandBlock: {
    width: "46%",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  logoImg: {
    width: 34,
    height: 34,
    objectFit: "contain",
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0284c7",
  },
  brandTagline: {
    fontSize: 8,
    color: "#475569",
    marginTop: 2,
  },
  sellerBlock: {
    width: "52%",
    textAlign: "right",
    fontSize: 7.5,
    lineHeight: 1.38,
    color: "#334155",
  },
  sellerName: {
    fontSize: 8.5,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 2,
  },
  titleBanner: {
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  docTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0c4a6e",
  },
  docMeta: {
    fontSize: 8,
    color: "#334155",
    marginTop: 2,
  },
  validBadge: {
    backgroundColor: "#0284c7",
    color: "#ffffff",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 700,
  },
  customerBox: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
    backgroundColor: "#f8fafc",
  },
  customerLabel: {
    fontSize: 7.5,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  customerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    fontSize: 8.2,
    color: "#0f172a",
  },
  customerBold: {
    fontWeight: 700,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 4,
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 7.5,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingVertical: 5,
    paddingHorizontal: 4,
    alignItems: "center",
    minHeight: 38,
  },
  tableRowAlt: {
    backgroundColor: "#f8fafc",
  },
  colNum: { width: "4%", textAlign: "center" },
  colImg: { width: "8%", alignItems: "center", justifyContent: "center" },
  colName: { width: "38%", paddingRight: 4 },
  colNameSeparate: { width: "28%", paddingRight: 4 },
  colUnit: { width: "8%", textAlign: "center" },
  colQty: { width: "8%", textAlign: "right", paddingRight: 4 },
  colPrice: { width: "15%", textAlign: "right", paddingRight: 4 },
  colPriceSep: { width: "11%", textAlign: "right", paddingRight: 4 },
  colNetSep: { width: "11%", textAlign: "right", paddingRight: 4 },
  colVatSep: { width: "10%", textAlign: "right", paddingRight: 4 },
  colAmount: { width: "19%", textAlign: "right", paddingRight: 2 },
  colAmountSep: { width: "12%", textAlign: "right", paddingRight: 2 },
  thumbImg: {
    width: 28,
    height: 28,
    objectFit: "contain",
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  thumbPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 3,
    backgroundColor: "#f1f5f9",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  prodLink: {
    color: "#0f172a",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 8,
  },
  prodSku: {
    fontSize: 6.8,
    color: "#64748b",
    marginTop: 1.5,
  },
  summaryWrapper: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 14,
  },
  summaryBox: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    padding: 8,
    backgroundColor: "#f8fafc",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3.5,
    fontSize: 8,
    color: "#334155",
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    paddingTop: 5,
    marginTop: 3,
    fontSize: 10,
    fontWeight: 700,
    color: "#0284c7",
  },
  footerGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
    gap: 12,
  },
  termsBlock: {
    width: "64%",
    fontSize: 7.5,
    lineHeight: 1.4,
    color: "#475569",
  },
  signatureLine: {
    marginTop: 16,
    paddingTop: 6,
    borderTopWidth: 0.8,
    borderTopColor: "#94a3b8",
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    fontWeight: 700,
    color: "#0f172a",
  },
  qrBlock: {
    width: "34%",
    borderWidth: 1,
    borderColor: "#bae6fd",
    backgroundColor: "#f0f9ff",
    borderRadius: 6,
    padding: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  qrImg: {
    width: 62,
    height: 62,
  },
  qrTextBox: {
    flex: 1,
    fontSize: 6.8,
    lineHeight: 1.35,
    color: "#0c4a6e",
  },
  qrLink: {
    marginTop: 3,
    fontSize: 6.8,
    fontWeight: 700,
    color: "#0284c7",
    textDecoration: "underline",
  },
  pageNumber: {
    position: "absolute",
    bottom: 16,
    left: 28,
    right: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#94a3b8",
  },
});

interface PreparedPdfProps {
  data: KpDocumentData;
  logoDataUrl: string | null;
  qrDataUrl: string;
  productImages: Record<string, string | null>;
}

function KpPdfDocument({
  data,
  logoDataUrl,
  qrDataUrl,
  productImages,
}: PreparedPdfProps) {
  const isUz = data.docLocale === "uz";
  const seller = isUz ? SORA_COMPANY_INFO.uz : SORA_COMPANY_INFO.ru;
  const currency = isUz ? "so'm" : "сум";
  const totals = calculateKpTotals(
    data.items.map((item) => ({ quantity: item.quantity, price: item.price })),
    {
      freeDeliveryThreshold: SORA_COMPANY_INFO.freeDeliveryThreshold,
      standardDeliveryFee: SORA_COMPANY_INFO.standardDeliveryFee,
      includeDelivery: true,
    }
  );
  const separateVat = data.vatMode === "separate";
  const displaySubtotal =
    typeof data.totalAmountOverride === "number" && data.totalAmountOverride > 0
      ? data.totalAmountOverride
      : totals.subtotalWithVat;
  const displayDelivery =
    displaySubtotal >= SORA_COMPANY_INFO.freeDeliveryThreshold
      ? 0
      : SORA_COMPANY_INFO.standardDeliveryFee;
  const displayVat = Math.round((displaySubtotal * 12) / 112);
  const displayGrandTotal = displaySubtotal + displayDelivery;

  return (
    <Document
      title={`KP ${data.orderNumber} — Sora.uz`}
      author="Sora.uz"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <View style={styles.logoRow}>
              {logoDataUrl && (
                <PdfImage src={logoDataUrl} style={styles.logoImg} />
              )}
              <View>
                <Text style={styles.brandTitle}>SORA.UZ</Text>
                <Text style={styles.brandTagline}>{seller.tagline}</Text>
              </View>
            </View>
            <Text style={styles.brandTagline}>
              {SORA_COMPANY_INFO.website} · {SORA_COMPANY_INFO.emailPrimary}
            </Text>
          </View>

          <View style={styles.sellerBlock}>
            <Text style={styles.sellerName}>{seller.legalName}</Text>
            <Text>
              {isUz ? "STIR (INN):" : "ИНН:"} {SORA_COMPANY_INFO.inn} ·{" "}
              {isUz ? "MFO:" : "МФО:"} {SORA_COMPANY_INFO.mfo}
            </Text>
            <Text>
              {isUz ? "H/R:" : "Р/с:"} {SORA_COMPANY_INFO.bankAccount}
            </Text>
            <Text>{seller.bankName}</Text>
            <Text>{seller.address}</Text>
            <Text>{SORA_COMPANY_INFO.phones.slice(0, 2).join(" · ")}</Text>
          </View>
        </View>

        {/* Document Banner */}
        <View style={styles.titleBanner}>
          <View>
            <Text style={styles.docTitle}>
              {isUz ? "TIJORAT TAKLIFI" : "КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ"} №{" "}
              {data.orderNumber}
            </Text>
            <Text style={styles.docMeta}>
              {isUz ? "Tuzilgan sana:" : "Дата:"}{" "}
              {formatKpDisplayDate(data.createdAtIso, data.docLocale, true)}
            </Text>
          </View>
          <View style={styles.validBadge}>
            <Text>
              {isUz ? "Amal qiladi:" : "Действует до:"}{" "}
              {formatKpDisplayDate(data.validUntilIso, data.docLocale)}
            </Text>
          </View>
        </View>

        {/* Customer Box */}
        <View style={styles.customerBox}>
          <Text style={styles.customerLabel}>
            {isUz ? "Buyurtmachi tashkilot" : "Организация-покупатель"}
          </Text>
          <View style={styles.customerRow}>
            <Text>
              <Text style={styles.customerBold}>
                {data.customer.companyName}
              </Text>
            </Text>
            {data.customer.companyInn && (
              <Text>
                {isUz ? "STIR:" : "ИНН:"}{" "}
                <Text style={styles.customerBold}>
                  {data.customer.companyInn}
                </Text>
              </Text>
            )}
            {data.customer.contactName && (
              <Text>
                {isUz ? "Mas'ul:" : "Контакт:"} {data.customer.contactName}
              </Text>
            )}
            {data.customer.phone && (
              <Text>
                {isUz ? "Tel:" : "Тел:"} {data.customer.phone}
              </Text>
            )}
          </View>
          {(data.customer.bankAccount ||
            data.customer.bankMfo ||
            data.customer.legalAddress) && (
            <View style={[styles.customerRow, { marginTop: 3 }]}>
              {data.customer.bankAccount && (
                <Text>
                  {isUz ? "H/R:" : "Р/с:"} {data.customer.bankAccount}
                </Text>
              )}
              {data.customer.bankMfo && (
                <Text>
                  {isUz ? "MFO:" : "МФО:"} {data.customer.bankMfo}
                </Text>
              )}
              {data.customer.legalAddress && (
                <Text>{data.customer.legalAddress}</Text>
              )}
            </View>
          )}
        </View>

        {/* Products Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text style={styles.colNum}>№</Text>
            <View style={styles.colImg}>
              <Text>{isUz ? "Rasm" : "Фото"}</Text>
            </View>
            <Text style={separateVat ? styles.colNameSeparate : styles.colName}>
              {isUz ? "Mahsulot nomi va artikul" : "Наименование и артикул"}
            </Text>
            <Text style={styles.colUnit}>{isUz ? "Birlik" : "Ед."}</Text>
            <Text style={styles.colQty}>{isUz ? "Soni" : "Кол-во"}</Text>
            <Text style={separateVat ? styles.colPriceSep : styles.colPrice}>
              {isUz ? "Narxi" : "Цена"}
            </Text>
            {separateVat && (
              <>
                <Text style={styles.colNetSep}>
                  {isUz ? "QQSsiz" : "Без НДС"}
                </Text>
                <Text style={styles.colVatSep}>
                  {isUz ? "QQS 12%" : "НДС 12%"}
                </Text>
              </>
            )}
            <Text style={separateVat ? styles.colAmountSep : styles.colAmount}>
              {isUz ? "Summa" : "Сумма"}
            </Text>
          </View>

          {data.items.map((item, idx) => {
            const line = totals.lines[idx];
            const thumb = productImages[item.id] || null;
            const productUrl = item.slug
              ? `${SORA_COMPANY_INFO.website}/${data.docLocale}/products/${item.slug}`
              : `${SORA_COMPANY_INFO.website}/${data.docLocale}/catalog`;
            const negotiableText = isUz ? "Kelishiladi" : "Договорная";

            return (
              <View
                key={`${item.id}-${idx}`}
                style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
                wrap={false}
              >
                <Text style={styles.colNum}>{idx + 1}</Text>
                <View style={styles.colImg}>
                  {thumb ? (
                    <PdfImage src={thumb} style={styles.thumbImg} />
                  ) : (
                    <View style={styles.thumbPlaceholder} />
                  )}
                </View>
                <View style={separateVat ? styles.colNameSeparate : styles.colName}>
                  <Link src={productUrl} style={styles.prodLink}>
                    {item.name}
                  </Link>
                  {item.sku && (
                    <Text style={styles.prodSku}>
                      {isUz ? "Artikul:" : "Арт:"} {item.sku}
                    </Text>
                  )}
                </View>
                <Text style={styles.colUnit}>{item.unit}</Text>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={separateVat ? styles.colPriceSep : styles.colPrice}>
                  {line.isNegotiable
                    ? negotiableText
                    : formatMoney(line.unitPriceWithVat)}
                </Text>
                {separateVat && (
                  <>
                    <Text style={styles.colNetSep}>
                      {line.isNegotiable
                        ? "—"
                        : formatMoney(line.lineNetWithoutVat)}
                    </Text>
                    <Text style={styles.colVatSep}>
                      {line.isNegotiable ? "—" : formatMoney(line.lineVatAmount)}
                    </Text>
                  </>
                )}
                <Text style={separateVat ? styles.colAmountSep : styles.colAmount}>
                  {line.isNegotiable
                    ? negotiableText
                    : `${formatMoney(line.lineTotalWithVat)} ${currency}`}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Summary */}
        <View style={styles.summaryWrapper} wrap={false}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text>{isUz ? "Mahsulotlar summasi:" : "Стоимость товаров:"}</Text>
              <Text>
                {formatMoney(displaySubtotal)} {currency}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>{isUz ? "Yetkazib berish:" : "Доставка:"}</Text>
              <Text>
                {displayDelivery === 0
                  ? isUz
                    ? "Bepul"
                    : "Бесплатно"
                  : `${formatMoney(displayDelivery)} ${currency}`}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>
                {separateVat
                  ? isUz
                    ? "QQSsiz summa:"
                    : "Сумма без НДС:"
                  : isUz
                  ? "Shu jumladan QQS (12%):"
                  : "В том числе НДС (12%):"}
              </Text>
              <Text>
                {formatMoney(
                  separateVat ? displaySubtotal - displayVat : displayVat
                )}{" "}
                {currency}
              </Text>
            </View>
            {separateVat && (
              <View style={styles.summaryRow}>
                <Text>{isUz ? "QQS (12%):" : "НДС (12%):"}</Text>
                <Text>
                  {formatMoney(displayVat)} {currency}
                </Text>
              </View>
            )}
            <View style={styles.summaryTotalRow}>
              <Text>{isUz ? "JAMI TO'LOV:" : "ИТОГО К ОПЛАТЕ:"}</Text>
              <Text>
                {formatMoney(displayGrandTotal)} {currency}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer with Terms & Public QR Code */}
        <View style={styles.footerGrid} wrap={false}>
          <View style={styles.termsBlock}>
            <Text>{seller.paymentTerms}</Text>
            <Text style={{ marginTop: 3 }}>{seller.warrantyNote}</Text>
            <View style={styles.signatureLine}>
              <Text>
                {seller.legalName} · {seller.directorRole}
              </Text>
              <Text>___________________ / M.O‘.</Text>
            </View>
          </View>

          <View style={styles.qrBlock}>
            <PdfImage src={qrDataUrl} style={styles.qrImg} />
            <View style={styles.qrTextBox}>
              <Text style={{ fontWeight: 700, marginBottom: 2 }}>
                {isUz ? "1C Elektron Pasport" : "Электронный паспорт 1С"}
              </Text>
              <Text>
                {isUz
                  ? "Holatni tekshirish va 1 bosishda buyurtma berish uchun skanerlang:"
                  : "Отсканируйте для проверки статуса и оформления в 1 клик:"}
              </Text>
              <Link src={data.publicUrl} style={styles.qrLink}>
                {isUz ? "Hujjatni ochish →" : "Открыть документ →"}
              </Link>
            </View>
          </View>
        </View>

        {/* Page Number Footer */}
        <View style={styles.pageNumber} fixed>
          <Text>
            {seller.legalName} · KP № {data.orderNumber}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              isUz
                ? `Sahifa ${pageNumber} / ${totalPages}`
                : `Стр. ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

/**
 * Generates and downloads a branded A4 PDF Commercial Offer (with CDN product images & QR code)
 * completely on the client side.
 */
export async function generateAndDownloadKpPdf(
  data: KpDocumentData
): Promise<void> {
  ensureRobotoFontsRegistered();

  const uniqueImgUrls = new Map<string, string>();
  for (const item of data.items) {
    if (item.picture && !uniqueImgUrls.has(item.id)) {
      uniqueImgUrls.set(item.id, item.picture);
    }
  }

  const [qrDataUrl, logoDataUrl, ...resolvedImages] = await Promise.all([
    generateKpQrDataUrl(data.publicUrl),
    resolvePdfSafeImageDataUrl("/logo.png", 128),
    ...Array.from(uniqueImgUrls.entries()).map(async ([id, url]) => ({
      id,
      dataUrl: await resolvePdfSafeImageDataUrl(url, 84),
    })),
  ]);

  const productImages: Record<string, string | null> = {};
  for (const entry of resolvedImages) {
    productImages[entry.id] = entry.dataUrl;
  }

  const blob = await pdf(
    <KpPdfDocument
      data={data}
      logoDataUrl={logoDataUrl}
      qrDataUrl={qrDataUrl}
      productImages={productImages}
    />
  ).toBlob();

  const safeNum = data.orderNumber.replace(/[^a-zA-Z0-9_-]/g, "_");
  triggerBrowserDownload(blob, `Sora_KP_${safeNum}.pdf`);
}
