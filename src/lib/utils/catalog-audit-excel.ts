import ExcelJS from "exceljs";
import type {
  AuditAggStats,
  AuditBrandStat,
  AuditCategoryNodeStat,
  AuditProductRow,
} from "./catalog-audit";
import {
  AUDIT_ISSUE_LABELS,
  CROSS_SELL_BUCKET_LABELS,
  SIMILAR_BUCKET_LABELS,
} from "./catalog-audit";

export interface BuildAuditXlsxOptions {
  brandStats?: AuditBrandStat[];
  categoryTreeStats?: AuditCategoryNodeStat[];
  uncategorizedStats?: AuditAggStats;
}

function styleWorksheetHeader(
  worksheet: ExcelJS.Worksheet,
  columnCount: number,
  fgArgb: string = "FF065F46",
  borderArgb: string = "FF047857"
): void {
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: fgArgb },
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
      top: { style: "thin", color: { argb: borderArgb } },
      left: { style: "thin", color: { argb: borderArgb } },
      bottom: { style: "medium", color: { argb: "FF064E3B" } },
      right: { style: "thin", color: { argb: borderArgb } },
    };
  });

  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columnCount },
  };
}

function applyRowGridBorders(row: ExcelJS.Row): void {
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.border = {
      top: { style: "thin", color: { argb: "FFE5E7EB" } },
      left: { style: "thin", color: { argb: "FFE5E7EB" } },
      bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
      right: { style: "thin", color: { argb: "FFE5E7EB" } },
    };
  });
}

function styleRelationStatusCell(
  cell: ExcelJS.Cell,
  bucket: "lt" | "eq" | "gt"
): void {
  cell.alignment = { vertical: "middle", horizontal: "center" };
  if (bucket === "eq") {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD1FAE5" },
    };
    cell.font = { color: { argb: "FF065F46" }, bold: true };
  } else if (bucket === "gt") {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0F2FE" },
    };
    cell.font = { color: { argb: "FF0369A1" }, bold: true };
  } else {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFEF3C7" },
    };
    cell.font = { color: { argb: "FFB45309" }, bold: true };
  }
}

function appendBrandsWorksheet(
  workbook: ExcelJS.Workbook,
  brandStats: AuditBrandStat[],
  isUz: boolean
): void {
  const sheetTitle = isUz ? "Brendlar Statistikasi" : "Статистика брендов";
  const ws = workbook.addWorksheet(sheetTitle, {
    views: [{ showGridLines: true, state: "frozen", ySplit: 1 }],
  });

  ws.columns = [
    { header: isUz ? "Brend" : "Бренд", key: "brand", width: 28 },
    {
      header: isUz ? "Jami mahsulot" : "Всего товаров",
      key: "totalProducts",
      width: 16,
    },
    {
      header: isUz ? "Katalog ulushi (%)" : "Доля в каталоге (%)",
      key: "sharePercent",
      width: 18,
    },
    { header: isUz ? "Omborda bor" : "В наличии", key: "inStock", width: 15 },
    {
      header: isUz ? "Omborda yo'q" : "Нет в наличии",
      key: "outOfStock",
      width: 16,
    },
    { header: isUz ? "Narxsiz" : "Без цены", key: "noPrice", width: 14 },
    { header: isUz ? "Rasmsiz" : "Без фото", key: "noImage", width: 14 },
    {
      header: isUz ? "Merchant tayyor" : "Готовы к Merchant",
      key: "merchantReady",
      width: 18,
    },
    {
      header: isUz ? "O'xshash = 4 ta" : "Похожие = 4 шт.",
      key: "similarEq4",
      width: 18,
    },
    {
      header: isUz ? "Birga xarid = 12 ta" : "С этим берут = 12 шт.",
      key: "crossSellEq12",
      width: 21,
    },
  ];

  styleWorksheetHeader(ws, 10, "FF1E3A8A", "FF1D4ED8");

  for (const stat of brandStats) {
    const label = stat.isUnbranded
      ? isUz
        ? "Brend ko'rsatilmagan"
        : "Без бренда"
      : stat.name;

    const row = ws.addRow({
      brand: label,
      totalProducts: stat.totalProducts,
      sharePercent: stat.sharePercent,
      inStock: stat.inStockCount,
      outOfStock: stat.outOfStockCount,
      noPrice: stat.noPriceCount,
      noImage: stat.noImageCount,
      merchantReady: stat.merchantReadyCount,
      similarEq4: stat.similarEq4Count,
      crossSellEq12: stat.crossSellEq12Count,
    });
    row.height = 20;

    row.getCell("brand").alignment = { vertical: "middle", horizontal: "left" };
    if (stat.isUnbranded) {
      row.getCell("brand").font = { italic: true, color: { argb: "FFB45309" } };
    }

    for (const numCol of [
      "totalProducts",
      "inStock",
      "outOfStock",
      "noPrice",
      "noImage",
      "merchantReady",
      "similarEq4",
      "crossSellEq12",
    ]) {
      const c = row.getCell(numCol);
      c.numFmt = "#,##0";
      c.alignment = { vertical: "middle", horizontal: "right" };
    }

    const shareCell = row.getCell("sharePercent");
    shareCell.numFmt = '0.0"%"';
    shareCell.alignment = { vertical: "middle", horizontal: "right" };

    applyRowGridBorders(row);
  }
}

function appendCategoriesWorksheet(
  workbook: ExcelJS.Workbook,
  treeStats: AuditCategoryNodeStat[],
  uncategorizedStats: AuditAggStats | undefined,
  isUz: boolean
): void {
  const sheetTitle = isUz ? "Kategoriyalar Daraxti" : "Дерево категорий";
  const ws = workbook.addWorksheet(sheetTitle, {
    views: [{ showGridLines: true, state: "frozen", ySplit: 1 }],
  });

  ws.columns = [
    { header: isUz ? "Daraja" : "Уровень", key: "depth", width: 10 },
    {
      header: isUz ? "Kategoriya / Subkategoriya" : "Категория / Подкатегория",
      key: "name",
      width: 44,
    },
    {
      header: isUz ? "To'g'ridan-to'g'ri" : "Прямых товаров",
      key: "directCount",
      width: 18,
    },
    {
      header: isUz ? "Daraxt bo'yicha jami" : "Итого с подкатегориями",
      key: "totalTreeCount",
      width: 22,
    },
    { header: isUz ? "Omborda bor" : "В наличии", key: "inStock", width: 14 },
    {
      header: isUz ? "Omborda yo'q" : "Нет в наличии",
      key: "outOfStock",
      width: 16,
    },
    { header: isUz ? "Narxsiz" : "Без цены", key: "noPrice", width: 14 },
    { header: isUz ? "Rasmsiz" : "Без фото", key: "noImage", width: 14 },
    {
      header: isUz ? "Merchant tayyor" : "Готовы к Merchant",
      key: "merchantReady",
      width: 18,
    },
    {
      header: isUz ? "Slug (URL)" : "Slug (URL)",
      key: "slug",
      width: 34,
    },
  ];

  styleWorksheetHeader(ws, 10, "FF0F766E", "FF0D9488");

  const addNodeRows = (nodes: AuditCategoryNodeStat[]) => {
    for (const node of nodes) {
      const indent = "   ".repeat(node.depth);
      const displayName = isUz
        ? node.nameUz || node.nameRu
        : node.nameRu || node.nameUz;
      const slug = isUz ? node.slugUz || node.slugRu : node.slugRu || node.slugUz;

      const row = ws.addRow({
        depth: node.depth,
        name: `${indent}${node.depth > 0 ? "↳ " : ""}${displayName}`,
        directCount: node.directCount,
        totalTreeCount: node.totalTreeCount,
        inStock: node.treeStats.inStockCount,
        outOfStock: node.treeStats.outOfStockCount,
        noPrice: node.treeStats.noPriceCount,
        noImage: node.treeStats.noImageCount,
        merchantReady: node.treeStats.merchantReadyCount,
        slug,
      });
      row.height = 20;

      const depthCell = row.getCell("depth");
      depthCell.alignment = { vertical: "middle", horizontal: "center" };

      const nameCell = row.getCell("name");
      nameCell.alignment = { vertical: "middle", horizontal: "left" };
      if (node.depth === 0) {
        nameCell.font = { bold: true, color: { argb: "FF0F172A" } };
      }

      for (const numCol of [
        "directCount",
        "totalTreeCount",
        "inStock",
        "outOfStock",
        "noPrice",
        "noImage",
        "merchantReady",
      ]) {
        const c = row.getCell(numCol);
        c.numFmt = "#,##0";
        c.alignment = { vertical: "middle", horizontal: "right" };
      }

      if (node.totalTreeCount === 0) {
        row.getCell("totalTreeCount").fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFEE2E2" },
        };
        row.getCell("totalTreeCount").font = {
          color: { argb: "FF991B1B" },
          bold: true,
        };
      }

      row.getCell("slug").alignment = { vertical: "middle", horizontal: "left" };
      applyRowGridBorders(row);

      if (node.children.length > 0) {
        addNodeRows(node.children);
      }
    }
  };

  addNodeRows(treeStats);

  if (uncategorizedStats && uncategorizedStats.totalProducts > 0) {
    const row = ws.addRow({
      depth: 0,
      name: isUz ? "Kategoriyasiz mahsulotlar" : "Товары без категории",
      directCount: uncategorizedStats.totalProducts,
      totalTreeCount: uncategorizedStats.totalProducts,
      inStock: uncategorizedStats.inStockCount,
      outOfStock: uncategorizedStats.outOfStockCount,
      noPrice: uncategorizedStats.noPriceCount,
      noImage: uncategorizedStats.noImageCount,
      merchantReady: uncategorizedStats.merchantReadyCount,
      slug: "",
    });
    row.height = 20;
    row.getCell("name").font = { italic: true, color: { argb: "FFB45309" } };
    applyRowGridBorders(row);
  }
}

/**
 * Generates a modern Microsoft Excel (.xlsx) workbook with 3 worksheets:
 * 1) Katalog Auditi (products + relation metrics)
 * 2) Brendlar Statistikasi
 * 3) Kategoriyalar va Subkategoriyalar
 */
export async function buildAuditXlsx(
  items: AuditProductRow[],
  locale: "uz" | "ru" = "uz",
  options?: BuildAuditXlsxOptions
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

  // Define columns (18 columns)
  worksheet.columns = [
    { header: "1C ID", key: "id", width: 14 },
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
    {
      header: isUz ? "O'xshash (soni)" : "Похожие (кол-во)",
      key: "similarCount",
      width: 16,
    },
    {
      header: isUz ? "O'xshash holati" : "Похожие (норма 4)",
      key: "similarBucket",
      width: 18,
    },
    {
      header: isUz ? "Birga xarid (soni)" : "С этим берут (кол-во)",
      key: "crossSellCount",
      width: 18,
    },
    {
      header: isUz ? "Birga xarid holati" : "С этим берут (норма 12)",
      key: "crossSellBucket",
      width: 22,
    },
    { header: isUz ? "Muammolar" : "Ошибки", key: "issues", width: 34 },
    {
      header: isUz ? "Sayt havolasi" : "Ссылка на сайте",
      key: "url",
      width: 42,
    },
  ];

  styleWorksheetHeader(worksheet, 18);

  // Populate data rows
  for (const item of items) {
    const issueText =
      item.issues.length > 0
        ? item.issues
            .map((k) =>
              k === "missing_seo" && item.seoMissingFields?.length
                ? `${AUDIT_ISSUE_LABELS[k][locale]} (${item.seoMissingFields.join(", ")})`
                : AUDIT_ISSUE_LABELS[k][locale]
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
      similarCount: item.similarCount,
      similarBucket: SIMILAR_BUCKET_LABELS[item.similarBucket][locale],
      crossSellCount: item.crossSellCount,
      crossSellBucket: CROSS_SELL_BUCKET_LABELS[item.crossSellBucket][locale],
      issues: issueText,
      url: productUrl ? { text: productUrl, hyperlink: productUrl } : "",
    });

    row.height = 20;

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
        fgColor: { argb: "FFD1FAE5" },
      };
      merchantCell.font = { color: { argb: "FF065F46" }, bold: true };
    } else {
      merchantCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFEE2E2" },
      };
      merchantCell.font = { color: { argb: "FF991B1B" }, bold: true };
    }

    const similarCountCell = row.getCell("similarCount");
    similarCountCell.numFmt = "#,##0";
    similarCountCell.alignment = { vertical: "middle", horizontal: "right" };

    styleRelationStatusCell(
      row.getCell("similarBucket"),
      item.similarBucket === "eq_4"
        ? "eq"
        : item.similarBucket === "gt_4"
        ? "gt"
        : "lt"
    );

    const crossSellCountCell = row.getCell("crossSellCount");
    crossSellCountCell.numFmt = "#,##0";
    crossSellCountCell.alignment = { vertical: "middle", horizontal: "right" };

    styleRelationStatusCell(
      row.getCell("crossSellBucket"),
      item.crossSellBucket === "eq_12"
        ? "eq"
        : item.crossSellBucket === "gt_12"
        ? "gt"
        : "lt"
    );

    const issuesCell = row.getCell("issues");
    issuesCell.alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };
    if (item.issues.length > 0) {
      issuesCell.font = { color: { argb: "FFB45309" } };
    }

    const urlCell = row.getCell("url");
    urlCell.alignment = { vertical: "middle", horizontal: "left" };
    if (productUrl) {
      urlCell.font = { color: { argb: "FF2563EB" }, underline: true };
    }

    applyRowGridBorders(row);
  }

  if (options?.brandStats && options.brandStats.length > 0) {
    appendBrandsWorksheet(workbook, options.brandStats, isUz);
  }

  if (
    options?.categoryTreeStats &&
    (options.categoryTreeStats.length > 0 ||
      (options.uncategorizedStats?.totalProducts ?? 0) > 0)
  ) {
    appendCategoriesWorksheet(
      workbook,
      options.categoryTreeStats,
      options.uncategorizedStats,
      isUz
    );
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
