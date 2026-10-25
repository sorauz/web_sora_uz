import { Product, getProductLocalized } from "../schemas/product";
import { Category, CategoryTreeNode } from "../schemas/category";
import { calculateProductPrice } from "./price";

/**
 * Strips HTML tags and normalizes whitespace into clean Markdown-friendly text.
 */
export function cleanHtmlToText(input: string): string {
  if (!input) return "";
  return input
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Generates clean, LLM-optimized Markdown for a single product page (.md).
 */
export function generateProductMarkdown(
  product: Product,
  locale: "uz" | "ru" = "uz",
  baseUrl = "https://sora.uz"
): string {
  const isUz = locale === "uz";
  const loc = getProductLocalized(product, locale);
  const canonicalSlug =
    (isUz ? product.uz?.slug_uz : product.ru?.slug_ru) ||
    product.uz?.slug_uz ||
    product.ru?.slug_ru ||
    loc.slug;

  const priceInfo = calculateProductPrice(product.price);
  const inStock = product.price?.stock !== "OutOfStock";

  let priceText = isUz ? "Kelishilgan holda (so'rov bo'yicha)" : "По запросу";
  if (priceInfo.price > 0) {
    if (priceInfo.hasDiscount && priceInfo.oldPrice) {
      priceText = isUz
        ? `${priceInfo.price.toLocaleString("ru-RU")} UZS (Chegirma -${priceInfo.discountPercent}%, asl narxi: ${priceInfo.oldPrice.toLocaleString("ru-RU")} UZS)`
        : `${priceInfo.price.toLocaleString("ru-RU")} UZS (Скидка -${priceInfo.discountPercent}%, старая цена: ${priceInfo.oldPrice.toLocaleString("ru-RU")} UZS)`;
    } else {
      priceText = `${priceInfo.price.toLocaleString("ru-RU")} UZS`;
    }
  }

  const stockText = inStock
    ? isUz
      ? "Omborda mavjud"
      : "В наличии"
    : isUz
      ? "Tugagan (Sotuvda yo'q)"
      : "Нет в наличии";

  const pictureUrl = product.main_picture
    ? product.main_picture.startsWith("http")
      ? product.main_picture
      : `${baseUrl}${product.main_picture.startsWith("/") ? "" : "/"}${product.main_picture}`
    : "";

  const lines: string[] = [];

  lines.push(`# ${loc.name}`);
  lines.push("");

  // Structured Summary Blockquote
  lines.push(`> **${isUz ? "Narxi" : "Цена"}:** ${priceText}  `);
  lines.push(`> **${isUz ? "Holati" : "Наличие"}:** ${stockText}  `);
  if (product.brand) {
    lines.push(`> **${isUz ? "Brend" : "Бренд"}:** ${product.brand}  `);
  }
  if (product.product_sku) {
    lines.push(`> **${isUz ? "Artikul (SKU)" : "Артикул (SKU)"}:** ${product.product_sku}  `);
  }
  if (product.barcode) {
    lines.push(`> **${isUz ? "Shtrixkod (Barcode)" : "Штрихкод (Barcode)"}:** ${product.barcode}  `);
  }
  if (loc.unit) {
    lines.push(`> **${isUz ? "O'lchov birligi" : "Единица измерения"}:** ${loc.unit}  `);
  }
  if (product.package) {
    lines.push(`> **${isUz ? "Qadoqda" : "Упаковка"}:** ${product.package}  `);
  }
  if (product.country) {
    lines.push(`> **${isUz ? "Ishlab chiqarilgan davlat" : "Страна производства"}:** ${product.country}  `);
  }
  if (loc.category) {
    const catLink = loc.category_slug
      ? `[${loc.category}](${baseUrl}/${locale}/category/${loc.category_slug}.md)`
      : loc.category;
    lines.push(`> **${isUz ? "Kategoriya" : "Категория"}:** ${catLink}  `);
  }
  lines.push(
    `> **${isUz ? "Onlayn xarid qilish" : "Купить онлайн"}:** ${baseUrl}/${locale}/products/${canonicalSlug}  `
  );
  lines.push(
    `> **${isUz ? "Markdown manzili" : "Markdown версия"}:** ${baseUrl}/${locale}/products/${canonicalSlug}.md  `
  );
  if (pictureUrl) {
    lines.push(`> **${isUz ? "Mahsulot rasmi" : "Изображение товара"}:** ${pictureUrl}  `);
  }

  // Attributes Section
  const validAttributes = (product.attributes || [])
    .map((attr) => {
      const prop = (isUz ? attr.property_uz : attr.property_ru) || attr.property_uz || attr.property_ru;
      const val = (isUz ? attr.value_uz : attr.value_ru) || attr.value_uz || attr.value_ru;
      return { prop: prop?.trim(), val: val?.trim() };
    })
    .filter((a) => Boolean(a.prop && a.val));

  if (validAttributes.length > 0) {
    lines.push("");
    lines.push(`## ${isUz ? "Asosiy parametrlari" : "Основные характеристики"}:`);
    for (const attr of validAttributes) {
      lines.push(`- **${attr.prop}:** ${attr.val}`);
    }
  }

  // Description Section
  const rawDesc =
    loc.product_description ||
    loc.short_description ||
    loc.meta_description ||
    "";
  const cleanDesc = cleanHtmlToText(rawDesc);

  lines.push("");
  lines.push(`## ${isUz ? "Mahsulot tavsifi" : "Описание товара"}:`);
  if (cleanDesc) {
    lines.push(cleanDesc);
  } else {
    lines.push(
      isUz
        ? `${loc.name} — Sora.uz internet-do'konida rasmiy kafolat va tezkor yetkazib berish xizmati bilan taqdim etiladi.`
        : `${loc.name} — представлен в интернет-магазине Sora.uz с официальной гарантией и быстрой доставкой.`
    );
  }

  // Related / Recommended Products Section
  const subCards = [
    ...(product.related_products || []),
    ...(product.recommended_products || []),
  ];
  const relatedLinks: string[] = [];
  const seenSlugs = new Set<string>();

  for (const item of subCards) {
    const itemName =
      (isUz ? item.name_uz : item.name_ru) ||
      item.name ||
      item.name_uz ||
      item.name_ru;
    const itemSlug =
      (isUz ? item.slug_uz : item.slug_ru) ||
      item.slug ||
      item.slug_uz ||
      item.slug_ru;
    if (itemName && itemSlug && !seenSlugs.has(itemSlug)) {
      seenSlugs.add(itemSlug);
      relatedLinks.push(
        `- [${itemName}](${baseUrl}/${locale}/products/${itemSlug}.md)`
      );
    }
  }

  if (relatedLinks.length > 0) {
    lines.push("");
    lines.push(
      `## ${isUz ? "O'xshash va tavsiya etilgan mahsulotlar" : "Похожие и рекомендуемые товары"}:`
    );
    lines.push(...relatedLinks.slice(0, 10));
  }

  // Commercial / Store Policy Section
  lines.push("");
  lines.push(`## ${isUz ? "Savdo shartlari" : "Условия покупки"}:`);
  if (isUz) {
    lines.push(
      "- **Yetkazib berish:** Toshkent shahrida 24 soat ichida (500 000 so'mdan yuqori xaridga bepul). Viloyatlarga BTS, Fargo, EMU pochta orqali 1–3 ish kunida."
    );
    lines.push(
      "- **To'lov:** Naqd pul, Payme, Click, Uzcard/Humo hamda korporativ B2B bank o'tkazmasi (Didox elektron hisob-faktura bilan)."
    );
    lines.push(
      `- **Kafolat:** [10 kunlik qaytarish va almashtirish kafolati](${baseUrl}/uz/warranty).`
    );
    lines.push(
      "- **Aloqa:** +998 (90) 326-47-57 | +998 (90) 969-90-90 | +998 (71) 228-05-78 | Telegram: https://t.me/sora_uz"
    );
  } else {
    lines.push(
      "- **Доставка:** По Ташкенту в течение 24 часов (бесплатно при заказе от 500 000 сум). В регионы через BTS, Fargo, EMU за 1–3 рабочих дня."
    );
    lines.push(
      "- **Оплата:** Наличными, Payme, Click, Uzcard/Humo, а также корпоративный безналичный расчет B2B (с ЭСФ Didox)."
    );
    lines.push(
      `- **Гарантия:** [10 дней на возврат и обмен](${baseUrl}/ru/warranty).`
    );
    lines.push(
      "- **Контакты:** +998 (90) 326-47-57 | +998 (90) 969-90-90 | +998 (71) 228-05-78 | Telegram: https://t.me/sora_uz"
    );
  }

  lines.push("");
  return lines.join("\n");
}

/**
 * Generates clean, LLM-optimized Markdown for a category index page (.md).
 */
export function generateCategoryMarkdown(params: {
  category: CategoryTreeNode;
  breadcrumb: Category[];
  products: Product[];
  locale: "uz" | "ru";
  baseUrl?: string;
}): string {
  const {
    category,
    breadcrumb,
    products,
    locale,
    baseUrl = "https://sora.uz",
  } = params;
  const isUz = locale === "uz";
  const categoryName =
    (isUz ? category.group_uz : category.group_ru) ||
    category.group_uz ||
    category.group_ru;
  const canonicalSlug =
    (isUz ? category.group_slug_uz : category.group_slug_ru) ||
    category.group_slug_uz ||
    category.group_slug_ru;

  const inStockCount = products.filter(
    (p) => p.price?.stock !== "OutOfStock"
  ).length;

  const breadcrumbText = breadcrumb
    .map((c) => {
      const cName = (isUz ? c.group_uz : c.group_ru) || c.group_uz;
      const cSlug = (isUz ? c.group_slug_uz : c.group_slug_ru) || c.group_slug_uz;
      return `[${cName}](${baseUrl}/${locale}/category/${cSlug}.md)`;
    })
    .join(" > ");

  const lines: string[] = [];

  lines.push(`# ${categoryName} — Sora.uz`);
  lines.push("");
  lines.push(
    `> **${isUz ? "Bo'lim yo'li" : "Раздел"}:** ${breadcrumbText || categoryName}  `
  );
  lines.push(
    `> **${isUz ? "Jami mahsulotlar" : "Всего товаров"}:** ${products.length} (${isUz ? `Omborda mavjud: ${inStockCount}` : `В наличии: ${inStockCount}`})  `
  );
  lines.push(
    `> **${isUz ? "Kategoriya sahifasi (HTML)" : "Страница категории (HTML)"}:** ${baseUrl}/${locale}/category/${canonicalSlug}  `
  );
  lines.push(
    `> **${isUz ? "Markdown indeks" : "Markdown индекс"}:** ${baseUrl}/${locale}/category/${canonicalSlug}.md  `
  );
  lines.push(
    `> **${isUz ? "Asosiy AI xaritasi" : "Главная AI карта"}:** ${baseUrl}/llms.txt  `
  );

  // Subcategories
  if (category.children && category.children.length > 0) {
    lines.push("");
    lines.push(`## ${isUz ? "Ichki toifalar (Subkategoriyalar)" : "Подкатегории"}:`);
    for (const sub of category.children) {
      const subName = (isUz ? sub.group_uz : sub.group_ru) || sub.group_uz;
      const subSlug =
        (isUz ? sub.group_slug_uz : sub.group_slug_ru) || sub.group_slug_uz;
      if (subName && subSlug) {
        lines.push(
          `- [${subName}](${baseUrl}/${locale}/category/${subSlug}.md)`
        );
      }
    }
  }

  // Products list
  lines.push("");
  lines.push(`## ${isUz ? "Mahsulotlar ro'yxati" : "Список товаров"} (${products.length}):`);
  lines.push("");

  for (const p of products) {
    const loc = getProductLocalized(p, locale);
    const pSlug =
      (isUz ? p.uz?.slug_uz : p.ru?.slug_ru) ||
      p.uz?.slug_uz ||
      p.ru?.slug_ru ||
      loc.slug;
    if (!loc.name || !pSlug) continue;

    const priceInfo = calculateProductPrice(p.price);
    const inStock = p.price?.stock !== "OutOfStock";

    const priceStr =
      priceInfo.price > 0
        ? `${priceInfo.price.toLocaleString("ru-RU")} UZS`
        : isUz
          ? "So'rov bo'yicha"
          : "По запросу";

    const stockStr = inStock
      ? isUz
        ? "Omborda mavjud"
        : "В наличии"
      : isUz
        ? "Tugagan"
        : "Нет в наличии";

    const brandPart = p.brand ? ` | ${isUz ? "Brend" : "Бренд"}: ${p.brand}` : "";
    const skuPart = p.product_sku ? ` | SKU: ${p.product_sku}` : "";

    lines.push(
      `- [${loc.name}](${baseUrl}/${locale}/products/${pSlug}.md) — **${priceStr}** | ${stockStr}${brandPart}${skuPart}`
    );
  }

  lines.push("");
  return lines.join("\n");
}
