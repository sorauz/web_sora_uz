"use client";

import ExcelJS from "exceljs";
import { KP_SELLER_INFO, SORA_COMPANY_INFO } from "@/lib/config/company";
import { calculateKpTotals } from "./calculations";
import {
  formatKpDisplayDate,
  triggerBrowserDownload,
  type KpDocumentData,
} from "./types";

async function loadExcelLogoBase64(src: string): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(src, {
      mode: "same-origin",
      cache: "default",
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob || blob.size === 0) return null;

    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(typeof reader.result === "string" ? reader.result : null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Generates and downloads a compact, formula-driven Excel (.xlsx) Commercial Offer
 * with SORA.UZ logo header, legal KP seller requisites, clickable product hyperlinks,
 * text-formatted SKUs, and A4 print setup.
 */
export async function generateAndDownloadKpExcel(
  data: KpDocumentData
): Promise<void> {
  const isUz = data.docLocale === "uz";
  const brand = isUz ? SORA_COMPANY_INFO.uz : SORA_COMPANY_INFO.ru;
  const kpSeller = isUz ? KP_SELLER_INFO.uz : KP_SELLER_INFO.ru;
  const currency = isUz ? "so'm" : "сум";
  const separateVat = data.vatMode === "separate";

  const logoBase64 = await loadExcelLogoBase64(KP_SELLER_INFO.logoPath);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sora.uz";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(isUz ? "Tijorat taklifi" : "КП", {
    pageSetup: {
      paperSize: 9, // A4
      orientation: separateVat ? "landscape" : "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
  });

  // Column layout
  if (separateVat) {
    sheet.columns = [
      { key: "num", width: 5 },
      { key: "sku", width: 16 },
      { key: "name", width: 38 },
      { key: "unit", width: 10 },
      { key: "qty", width: 10 },
      { key: "price", width: 16 },
      { key: "net", width: 16 },
      { key: "vat", width: 14 },
      { key: "total", width: 18 },
    ];
  } else {
    sheet.columns = [
      { key: "num", width: 5 },
      { key: "sku", width: 16 },
      { key: "name", width: 46 },
      { key: "unit", width: 10 },
      { key: "qty", width: 11 },
      { key: "price", width: 17 },
      { key: "total", width: 19 },
    ];
  }

  const lastColLetter = separateVat ? "I" : "G";

  // 1. Top Brand Header (Rows 1–2): Combined Logo + Slogan image, Tagline, and Website Link
  sheet.mergeCells("A1:B2");
  sheet.getRow(1).height = 24;
  sheet.getRow(2).height = 20;

  if (logoBase64) {
    const logoId = workbook.addImage({
      base64: logoBase64,
      extension: "png",
    });
    sheet.addImage(logoId, {
      tl: { col: 0.08, row: 0.12 },
      ext: { width: 136, height: 48 },
    });
  } else {
    const logoFallback = sheet.getCell("A1");
    logoFallback.value = "SORA.UZ";
    logoFallback.font = {
      name: "Calibri",
      size: 16,
      bold: true,
      color: { argb: "FFBE185D" },
    };
    logoFallback.alignment = { vertical: "middle", horizontal: "left" };
  }

  sheet.mergeCells(`C1:${lastColLetter}1`);
  const taglineCell = sheet.getCell("C1");
  taglineCell.value = brand.tagline;
  taglineCell.font = {
    name: "Calibri",
    size: 11,
    bold: true,
    color: { argb: "FF0F172A" },
  };
  taglineCell.alignment = { vertical: "bottom", horizontal: "right" };

  sheet.mergeCells(`C2:${lastColLetter}2`);
  const websiteCell = sheet.getCell("C2");
  websiteCell.value = {
    text: `${SORA_COMPANY_INFO.website}  ·  ${SORA_COMPANY_INFO.emailPrimary}`,
    hyperlink: SORA_COMPANY_INFO.website,
  };
  websiteCell.font = {
    name: "Calibri",
    size: 10,
    bold: true,
    color: { argb: "FF0284C7" },
    underline: true,
  };
  websiteCell.alignment = { vertical: "top", horizontal: "right" };

  // 2. Title Row (Row 4)
  sheet.mergeCells(`A4:${lastColLetter}4`);
  const titleCell = sheet.getCell("A4");
  titleCell.value = `${
    isUz ? "TIJORAT TAKLIFI" : "КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ"
  } № ${data.orderNumber}`;
  titleCell.font = {
    name: "Calibri",
    size: 14,
    bold: true,
    color: { argb: "FF0C4A6E" },
  };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF0F9FF" },
  };
  titleCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  sheet.getRow(4).height = 26;

  // 3. Date & Validity (Row 5)
  sheet.mergeCells(`A5:${lastColLetter}5`);
  sheet.getCell("A5").value = `${
    isUz ? "Sana:" : "Дата:"
  } ${formatKpDisplayDate(data.createdAtIso, data.docLocale, true)}   |   ${
    isUz ? "Amal qilish muddati (1C):" : "Действительно до (1С):"
  } ${formatKpDisplayDate(data.validUntilIso, data.docLocale)}`;
  sheet.getCell("A5").font = {
    name: "Calibri",
    size: 10,
    bold: true,
    color: { argb: "FF0369A1" },
  };

  // 4. Seller Requisites (Rows 6–7, KP_SELLER_INFO)
  sheet.mergeCells(`A6:${lastColLetter}6`);
  const sellerRow1Cell = sheet.getCell("A6");
  sellerRow1Cell.value = `${isUz ? "Sotuvchi:" : "Продавец:"} ${kpSeller.legalName} | ${
    isUz ? "STIR:" : "ИНН:"
  } ${KP_SELLER_INFO.inn} | ${isUz ? "QQS kodi:" : "Рег. код НДС:"} ${
    KP_SELLER_INFO.vatRegCode
  } — ${kpSeller.vatStatus} | ${isUz ? "OKED:" : "ОКЭД:"} ${KP_SELLER_INFO.oked} | ${
    isUz ? "Tovar kelib chiqishi:" : "Происхождение товара:"
  } ${kpSeller.goodsOrigin}`;
  sellerRow1Cell.font = {
    name: "Calibri",
    size: 9.5,
    bold: true,
    color: { argb: "FF1E293B" },
  };
  sellerRow1Cell.alignment = {
    vertical: "middle",
    horizontal: "left",
    wrapText: true,
  };
  sheet.getRow(6).height = 28;

  sheet.mergeCells(`A7:${lastColLetter}7`);
  const sellerRow2Cell = sheet.getCell("A7");
  sellerRow2Cell.value = `${isUz ? "H/R:" : "Р/с:"} ${KP_SELLER_INFO.bankAccount} | ${
    isUz ? "MFO:" : "МФО:"
  } ${KP_SELLER_INFO.mfo} | ${isUz ? "Bank:" : "Банк:"} ${kpSeller.bankName} | ${
    isUz ? "Manzil:" : "Адрес:"
  } ${kpSeller.address} | ${isUz ? "Tel:" : "Тел:"} ${KP_SELLER_INFO.phones.join(", ")}`;
  sellerRow2Cell.font = {
    name: "Calibri",
    size: 9,
    color: { argb: "FF334155" },
  };
  sellerRow2Cell.alignment = {
    vertical: "middle",
    horizontal: "left",
    wrapText: true,
  };
  sheet.getRow(7).height = 28;

  // 5. Buyer Details (Rows 8–9)
  sheet.mergeCells(`A8:${lastColLetter}8`);
  const customerParts = [
    `${isUz ? "Buyurtmachi:" : "Покупатель:"} ${data.customer.companyName}`,
    data.customer.companyInn
      ? `${isUz ? "STIR:" : "ИНН:"} ${data.customer.companyInn}`
      : "",
    data.customer.contactName
      ? `${isUz ? "Mas'ul:" : "Контакт:"} ${data.customer.contactName}`
      : "",
    data.customer.phone ? `${isUz ? "Tel:" : "Тел:"} ${data.customer.phone}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
  sheet.getCell("A8").value = customerParts;
  sheet.getCell("A8").font = {
    name: "Calibri",
    size: 10,
    bold: true,
    color: { argb: "FF0F172A" },
  };

  if (data.customer.bankAccount || data.customer.bankMfo || data.customer.legalAddress) {
    sheet.mergeCells(`A9:${lastColLetter}9`);
    sheet.getCell("A9").value = [
      data.customer.bankAccount ? `${isUz ? "H/R:" : "Р/с:"} ${data.customer.bankAccount}` : "",
      data.customer.bankMfo ? `MFO: ${data.customer.bankMfo}` : "",
      data.customer.legalAddress || "",
    ]
      .filter(Boolean)
      .join(" | ");
    sheet.getCell("A9").font = { name: "Calibri", size: 9, color: { argb: "FF475569" } };
  }

  // 6. Table Header Row (Row 11)
  const headerRowIdx = 11;
  const headers = separateVat
    ? [
        "№",
        isUz ? "Artikul (SKU)" : "Артикул (SKU)",
        isUz ? "Mahsulot nomi" : "Наименование товара",
        isUz ? "Birlik" : "Ед. изм.",
        isUz ? "Miqdori" : "Кол-во",
        isUz ? `Narxi (${currency})` : `Цена (${currency})`,
        isUz ? "QQSsiz summa" : "Сумма без НДС",
        isUz ? "QQS (12%)" : "НДС (12%)",
        isUz ? `Jami (${currency})` : `Сумма (${currency})`,
      ]
    : [
        "№",
        isUz ? "Artikul (SKU)" : "Артикул (SKU)",
        isUz ? "Mahsulot nomi" : "Наименование товара",
        isUz ? "Birlik" : "Ед. изм.",
        isUz ? "Miqdori" : "Кол-во",
        isUz ? `Birlik narxi (${currency})` : `Цена (${currency})`,
        isUz ? `Jami summa (${currency})` : `Сумма (${currency})`,
      ];

  const headerRow = sheet.getRow(headerRowIdx);
  headerRow.values = headers;
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
    };
  });

  // 5. Data Rows
  const totals = calculateKpTotals(
    data.items.map((item) => ({ quantity: item.quantity, price: item.price })),
    {
      freeDeliveryThreshold: SORA_COMPANY_INFO.freeDeliveryThreshold,
      standardDeliveryFee: SORA_COMPANY_INFO.standardDeliveryFee,
      includeDelivery: true,
    }
  );

  const firstDataRow = headerRowIdx + 1;
  data.items.forEach((item, idx) => {
    const r = firstDataRow + idx;
    const line = totals.lines[idx];
    const row = sheet.getRow(r);
    const productUrl = item.slug
      ? `${SORA_COMPANY_INFO.website}/${data.docLocale}/products/${item.slug}`
      : `${SORA_COMPANY_INFO.website}/${data.docLocale}/catalog`;

    row.getCell(1).value = idx + 1;
    row.getCell(2).value = item.sku || "—";
    row.getCell(2).numFmt = "@"; // Preserves leading zeros
    row.getCell(3).value = { text: item.name, hyperlink: productUrl };
    row.getCell(3).font = {
      name: "Calibri",
      size: 10,
      color: { argb: "FF0369A1" },
      underline: true,
    };
    row.getCell(4).value = item.unit;
    row.getCell(5).value = line.quantity;

    if (line.isNegotiable) {
      row.getCell(6).value = isUz ? "Kelishiladi" : "Договорная";
      if (separateVat) {
        row.getCell(7).value = 0;
        row.getCell(8).value = 0;
        row.getCell(9).value = 0;
      } else {
        row.getCell(7).value = 0;
      }
    } else {
      row.getCell(6).value = line.unitPriceWithVat;
      if (separateVat) {
        row.getCell(9).value = {
          formula: `E${r}*F${r}`,
          result: line.lineTotalWithVat,
        };
        row.getCell(7).value = {
          formula: `ROUND(I${r}/1.12,2)`,
          result: line.lineNetWithoutVat,
        };
        row.getCell(8).value = {
          formula: `I${r}-G${r}`,
          result: line.lineVatAmount,
        };
      } else {
        row.getCell(7).value = {
          formula: `E${r}*F${r}`,
          result: line.lineTotalWithVat,
        };
      }
    }

    row.height = 20;
    const numCols = separateVat ? 9 : 7;
    for (let c = 1; c <= numCols; c++) {
      const cell = row.getCell(c);
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
      if (c !== 3) {
        cell.font = { name: "Calibri", size: 10, color: { argb: "FF0F172A" } };
      }
      if (c === 1 || c === 4) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
      } else if (c >= 5) {
        cell.alignment = { vertical: "middle", horizontal: "right" };
        if (c >= 6 && typeof cell.value !== "string") {
          cell.numFmt = "#,##0";
        }
      } else {
        cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
      }
    }
  });

  const lastDataRow = firstDataRow + data.items.length - 1;
  const totalCol = separateVat ? "I" : "G";

  // 6. Summary Rows with live Excel formulas
  const subtotalRowIdx = lastDataRow + 2;
  const deliveryRowIdx = lastDataRow + 3;
  const vatRowIdx = lastDataRow + 4;
  const grandTotalRowIdx = lastDataRow + 5;

  const labelColIdx = separateVat ? 8 : 6;
  const valColIdx = separateVat ? 9 : 7;

  const subtotalRow = sheet.getRow(subtotalRowIdx);
  subtotalRow.getCell(labelColIdx).value = isUz ? "Mahsulotlar summasi:" : "Итого товары:";
  subtotalRow.getCell(valColIdx).value = {
    formula: `SUM(${totalCol}${firstDataRow}:${totalCol}${lastDataRow})`,
    result: totals.subtotalWithVat,
  };
  subtotalRow.getCell(valColIdx).numFmt = "#,##0";

  const deliveryRow = sheet.getRow(deliveryRowIdx);
  deliveryRow.getCell(labelColIdx).value = isUz ? "Yetkazib berish:" : "Доставка:";
  deliveryRow.getCell(valColIdx).value = totals.deliveryFee;
  deliveryRow.getCell(valColIdx).numFmt = "#,##0";

  const vatRow = sheet.getRow(vatRowIdx);
  vatRow.getCell(labelColIdx).value = isUz
    ? "Shu jumladan QQS (12%):"
    : "В том числе НДС (12%):";
  vatRow.getCell(valColIdx).value = separateVat
    ? {
        formula: `SUM(H${firstDataRow}:H${lastDataRow})`,
        result: totals.vatAmount,
      }
    : {
        formula: `ROUND(${totalCol}${subtotalRowIdx}*12/112,0)`,
        result: totals.vatAmount,
      };
  vatRow.getCell(valColIdx).numFmt = "#,##0";

  const grandRow = sheet.getRow(grandTotalRowIdx);
  grandRow.getCell(labelColIdx).value = isUz ? "JAMI TO'LOV:" : "ИТОГО К ОПЛАТЕ:";
  grandRow.getCell(valColIdx).value = {
    formula: `${totalCol}${subtotalRowIdx}+${totalCol}${deliveryRowIdx}`,
    result: totals.grandTotal,
  };
  grandRow.getCell(valColIdx).numFmt = "#,##0";
  grandRow.getCell(labelColIdx).font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF0284C7" } };
  grandRow.getCell(valColIdx).font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF0284C7" } };

  [subtotalRow, deliveryRow, vatRow, grandRow].forEach((r) => {
    r.getCell(labelColIdx).alignment = { horizontal: "right", vertical: "middle" };
    r.getCell(valColIdx).alignment = { horizontal: "right", vertical: "middle" };
  });

  // 7. Footer terms + Director signature + Public QR Check Link
  const footerRowIdx = grandTotalRowIdx + 2;
  sheet.mergeCells(`A${footerRowIdx}:${lastColLetter}${footerRowIdx}`);
  sheet.getCell(`A${footerRowIdx}`).value = brand.paymentTerms;
  sheet.getCell(`A${footerRowIdx}`).font = { name: "Calibri", size: 9, color: { argb: "FF475569" } };

  const directorRowIdx = footerRowIdx + 1;
  sheet.mergeCells(`A${directorRowIdx}:${lastColLetter}${directorRowIdx}`);
  sheet.getCell(`A${directorRowIdx}`).value = `${kpSeller.legalName}  ·  ${kpSeller.directorRole}: ${KP_SELLER_INFO.directorName}`;
  sheet.getCell(`A${directorRowIdx}`).font = {
    name: "Calibri",
    size: 9.5,
    bold: true,
    color: { argb: "FF0F172A" },
  };

  const linkRowIdx = directorRowIdx + 1;
  sheet.mergeCells(`A${linkRowIdx}:${lastColLetter}${linkRowIdx}`);
  sheet.getCell(`A${linkRowIdx}`).value = {
    text: isUz
      ? `Hujjatning 1C dagi jonli holatini tekshirish va 1 bosishda buyurtma berish: ${data.publicUrl}`
      : `Проверить актуальный статус документа в 1С и оформить в 1 клик: ${data.publicUrl}`,
    hyperlink: data.publicUrl,
  };
  sheet.getCell(`A${linkRowIdx}`).font = {
    name: "Calibri",
    size: 10,
    bold: true,
    color: { argb: "FF0284C7" },
    underline: true,
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const safeNum = data.orderNumber.replace(/[^a-zA-Z0-9_-]/g, "_");
  triggerBrowserDownload(blob, `Sora_KP_${safeNum}.xlsx`);
}
