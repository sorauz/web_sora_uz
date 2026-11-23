import ExcelJS from "exceljs";
import type { AuditProductRow } from "./catalog-audit";
import { AUDIT_ISSUE_LABELS } from "./catalog-audit";

/**
 * Generates a modern Microsoft Excel (.xlsx) file with professional formatting,
 * auto-filters, frozen header row, currency formatting, and clickable hyperlinks.
 */
export async function buildAuditXlsx(
  items: AuditProductRow[],
  locale: "uz" | "ru" = "uz",
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sora.uz 1C Catalog Audit";
  workbook.lastModifiedBy = "Sora.uz";
  workbook.created = new Date();
  workbook.modified = new Date();

  const isUz = locale === "uz";
  const sheetName = isUz ? "Katalog Auditi" : "Аудит Каталога";
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true, state: "frozen", ySplit: 1 }],
  });

  // Define columns
  worksheet.columns = [
    { header: isUz ? "1C ID" : "1C ID", key: "id", width: 14 },
    { header: isUz ? "Artikul (SKU)" : "Артикул (SKU)", key: "sku", width: 16 },
    {
      header: isUz ? "Mahsulot Nomi (UZ)" : "Наименование (UZ)",
      key: "nameUz",
      width: 36,
    },
    {
      header: isUz ? "Mahsulot Nomi (RU)" : "Наименование (RU)",
      key: "nameRu",
      width: 36,
    },
    { header: isUz ? "Brend" : "Бренд", key: "brand", width: 18 },
    {
      header: isUz ? "Kategoriya" : "Категория",
      key: "category",
      width: 24,
    },
    {
      header: isUz ? "Chakana narx (so'm)" : "Розн. цена (сум)",
      key: "retailPrice",
      width: 20,
    },
    {
      header: isUz ? "Ulgurji narx (so'm)" : "Опт. цена (сум)",
      key: "wholesalePrice",
      width: 20,
    },
    { header: isUz ? "Ombor holati" : "Наличие", key: "stock", width: 16 },
    {
      header: isUz ? "Shtrix-kod (GTIN)" : "Штрихкод (GTIN)",
      key: "barcode",
      width: 20,
    },
    { header: isUz ? "Rasm" : "Фото", key: "hasImage", width: 12 },
    {
      header: isUz ? "Merchant statusi" : "Статус Merchant",
      key: "merchantApproved",
      width: 18,
    },
    { header: isUz ? "Muammolar" : "Ошибки", key: "issues", width: 34 },
    {
      header: isUz ? "Sayt havolasi" : "Ссылка на сайте",
      key: "url",
      width: 42,
    },
  ];

  // Style header row (Row 1)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF065F46" }, // Emerald-800
    };
    cell.font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FF047857" } },
      left: { style: "thin", color: { argb: "FF047857" } },
      bottom: { style: "medium", color: { argb: "FF064E3B" } },
      right: { style: "thin", color: { argb: "FF047857" } },
    };
  });

  // Enable AutoFilter on header row
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 14 },
  };

  // Populate data rows
  for (const item of items) {
    const issueText =
      item.issues.length > 0
        ? item.issues
            .map((k) =>
              k === "missing_seo" && item.seoMissingFields?.length
                ? `${AUDIT_ISSUE_LABELS[k][locale]} (${item.seoMissingFields.join(", ")})`
                : AUDIT_ISSUE_LABELS[k][locale],
            )
            .join("; ")
        : isUz
          ? "Muammo yo'q"
          : "Без ошибок";

    const productSlug = locale === "uz" ? item.slugUz : item.slugRu;
    const productUrl = productSlug
      ? `https://sora.uz/${locale}/products/${productSlug}`
      : "";

    const categoryName = isUz ? item.categoryUz : item.categoryRu;
    const hasImageText = item.hasImage
      ? isUz
        ? "Ha"
        : "Да"
      : isUz
        ? "Yo'q"
        : "Нет";
    const merchantText = item.merchantApproved
      ? isUz
        ? "Tayyor"
        : "Одобрен"
      : isUz
        ? "Muammoli"
        : "Отклонен";

    const row = worksheet.addRow({
      id: item.id,
      sku: item.sku,
      nameUz: item.nameUz,
      nameRu: item.nameRu,
      brand: item.brand,
      category: categoryName,
      retailPrice: item.retailPrice,
      wholesalePrice: item.wholesalePrice,
      stock: item.stock,
      barcode: item.barcode,
      hasImage: hasImageText,
      merchantApproved: merchantText,
      issues: issueText,
      url: productUrl ? { text: productUrl, hyperlink: productUrl } : "",
    });

    row.height = 20;

    // Formatting individual cells
    const idCell = row.getCell("id");
    idCell.numFmt = "@";
    idCell.alignment = { vertical: "middle", horizontal: "center" };

    const skuCell = row.getCell("sku");
    skuCell.numFmt = "@";
    skuCell.alignment = { vertical: "middle", horizontal: "left" };

    row.getCell("nameUz").alignment = { vertical: "middle", horizontal: "left" };
    row.getCell("nameRu").alignment = { vertical: "middle", horizontal: "left" };
    row.getCell("brand").alignment = { vertical: "middle", horizontal: "left" };
    row.getCell("category").alignment = {
      vertical: "middle",
      horizontal: "left",
    };

    const retailCell = row.getCell("retailPrice");
    retailCell.numFmt = "#,##0";
    retailCell.alignment = { vertical: "middle", horizontal: "right" };

    const wholesaleCell = row.getCell("wholesalePrice");
    wholesaleCell.numFmt = "#,##0";
    wholesaleCell.alignment = { vertical: "middle", horizontal: "right" };

    row.getCell("stock").alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    const barcodeCell = row.getCell("barcode");
    barcodeCell.numFmt = "@";
    barcodeCell.alignment = { vertical: "middle", horizontal: "center" };

    const imageCell = row.getCell("hasImage");
    imageCell.alignment = { vertical: "middle", horizontal: "center" };
    if (!item.hasImage) {
      imageCell.font = { color: { argb: "FFDC2626" }, bold: true };
    }

    const merchantCell = row.getCell("merchantApproved");
    merchantCell.alignment = { vertical: "middle", horizontal: "center" };
    if (item.merchantApproved) {
      merchantCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD1FAE5" }, // emerald-100
      };
      merchantCell.font = { color: { argb: "FF065F46" }, bold: true };
    } else {
      merchantCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFEE2E2" }, // red-100
      };
      merchantCell.font = { color: { argb: "FF991B1B" }, bold: true };
    }

    const issuesCell = row.getCell("issues");
    issuesCell.alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };
    if (item.issues.length > 0) {
      issuesCell.font = { color: { argb: "FFB45309" } }; // amber-700
    }

    const urlCell = row.getCell("url");
    urlCell.alignment = { vertical: "middle", horizontal: "left" };
    if (productUrl) {
      urlCell.font = { color: { argb: "FF2563EB" }, underline: true };
    }

    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE5E7EB" } },
        left: { style: "thin", color: { argb: "FFE5E7EB" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        right: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
    });
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
