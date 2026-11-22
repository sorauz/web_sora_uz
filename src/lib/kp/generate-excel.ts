"use client";

import ExcelJS from "exceljs";
import { SORA_COMPANY_INFO } from "@/lib/config/company";
import { calculateKpTotals } from "./calculations";
import {
  formatKpDisplayDate,
  triggerBrowserDownload,
  type KpDocumentData,
} from "./types";

/**
 * Generates and downloads a compact, formula-driven Excel (.xlsx) Commercial Offer
 * with clickable product hyperlinks, text-formatted SKUs, and A4 print setup.
 */
export async function generateAndDownloadKpExcel(
  data: KpDocumentData
): Promise<void> {
  const isUz = data.docLocale === "uz";
  const seller = isUz ? SORA_COMPANY_INFO.uz : SORA_COMPANY_INFO.ru;
  const currency = isUz ? "so'm" : "сум";
  const separateVat = data.vatMode === "separate";

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
      { key: "sku", width: 15 },
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
      { key: "sku", width: 15 },
      { key: "name", width: 46 },
      { key: "unit", width: 10 },
      { key: "qty", width: 11 },
      { key: "price", width: 17 },
      { key: "total", width: 19 },
    ];
  }

  const lastColLetter = separateVat ? "I" : "G";

  // 1. Title Row
  sheet.mergeCells(`A1:${lastColLetter}1`);
  const titleCell = sheet.getCell("A1");
  titleCell.value = `${
    isUz ? "TIJORAT TAKLIFI" : "КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ"
  } № ${data.orderNumber}`;
  titleCell.font = { name: "Calibri", size: 15, bold: true, color: { argb: "FF0C4A6E" } };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF0F9FF" },
  };
  titleCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  sheet.getRow(1).height = 28;

  // 2. Date & Validity
  sheet.mergeCells(`A2:${lastColLetter}2`);
  sheet.getCell("A2").value = `${
    isUz ? "Sana:" : "Дата:"
  } ${formatKpDisplayDate(data.createdAtIso, data.docLocale, true)}   |   ${
    isUz ? "Amal qilish muddati (1C):" : "Действительно до (1С):"
  } ${formatKpDisplayDate(data.validUntilIso, data.docLocale)}`;
  sheet.getCell("A2").font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF0369A1" } };

  // 3. Seller & Buyer Details
  sheet.mergeCells(`A4:${lastColLetter}4`);
  sheet.getCell("A4").value = `${isUz ? "Sotuvchi:" : "Продавец:"} ${seller.legalName} | ${
    isUz ? "STIR:" : "ИНН:"
  } ${SORA_COMPANY_INFO.inn} | ${isUz ? "H/R:" : "Р/с:"} ${SORA_COMPANY_INFO.bankAccount} | MFO: ${
    SORA_COMPANY_INFO.mfo
  } | ${SORA_COMPANY_INFO.phones[0]}`;
  sheet.getCell("A4").font = { name: "Calibri", size: 9.5, color: { argb: "FF334155" } };

  sheet.mergeCells(`A5:${lastColLetter}5`);
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
  sheet.getCell("A5").value = customerParts;
  sheet.getCell("A5").font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF0F172A" } };

  if (data.customer.bankAccount || data.customer.bankMfo || data.customer.legalAddress) {
    sheet.mergeCells(`A6:${lastColLetter}6`);
    sheet.getCell("A6").value = [
      data.customer.bankAccount ? `${isUz ? "H/R:" : "Р/с:"} ${data.customer.bankAccount}` : "",
      data.customer.bankMfo ? `MFO: ${data.customer.bankMfo}` : "",
      data.customer.legalAddress || "",
    ]
      .filter(Boolean)
      .join(" | ");
    sheet.getCell("A6").font = { name: "Calibri", size: 9, color: { argb: "FF475569" } };
  }

  // 4. Table Header Row (Row 8)
  const headerRowIdx = 8;
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

  // 7. Footer terms + Public QR Check Link
  const footerRowIdx = grandTotalRowIdx + 2;
  sheet.mergeCells(`A${footerRowIdx}:${lastColLetter}${footerRowIdx}`);
  sheet.getCell(`A${footerRowIdx}`).value = seller.paymentTerms;
  sheet.getCell(`A${footerRowIdx}`).font = { name: "Calibri", size: 9, color: { argb: "FF475569" } };

  const linkRowIdx = footerRowIdx + 1;
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
