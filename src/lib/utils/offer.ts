import { OfferItem } from "../schemas/offer";
import { Product } from "../schemas/product";
import { ProductPriceStock } from "../schemas/price";

/**
 * Checks if a 1C special offer is currently active according to its time range.
 */
export function isOfferActive(item: {
  Offer_start_time?: string;
  Offer_end_time?: string;
  [key: string]: unknown;
}): boolean {
  const now = new Date();

  if (item.Offer_start_time) {
    const start = new Date(item.Offer_start_time);
    if (!isNaN(start.getTime()) && now < start) {
      return false;
    }
  }

  if (item.Offer_end_time) {
    const end = new Date(item.Offer_end_time);
    if (!isNaN(end.getTime()) && now > end) {
      return false;
    }
  }

  return true;
}

export interface OfferBadgeInfo {
  text: string;
  variant: "rose" | "blue" | "amber" | "emerald";
  className: string;
}

/**
 * Returns localized badge text and styling for each 1C offer category.
 */
export function getOfferBadge(
  offerName: string,
  locale: "uz" | "ru" = "uz"
): OfferBadgeInfo {
  const lower = offerName.toLowerCase().replace(/_/g, " ");

  if (lower.includes("low price") || lower.includes("guarantee")) {
    return {
      text: locale === "uz" ? "Eng arzon narx" : "Лучшая цена",
      variant: "blue",
      className: "bg-blue-600 text-white shadow-xs",
    };
  }

  if (lower.includes("promotion")) {
    return {
      text: locale === "uz" ? "Aksiya" : "Скидка",
      variant: "rose",
      className: "bg-rose-600 text-white shadow-xs",
    };
  }

  if (lower.includes("popular") || lower.includes("top")) {
    return {
      text: locale === "uz" ? "Xit" : "Хит",
      variant: "amber",
      className: "bg-amber-500 text-white shadow-xs",
    };
  }

  if (lower.includes("new")) {
    return {
      text: locale === "uz" ? "Yangi" : "Новинка",
      variant: "emerald",
      className: "bg-emerald-600 text-white shadow-xs",
    };
  }

  return {
    text: offerName,
    variant: "blue",
    className: "bg-blue-600 text-white shadow-xs",
  };
}

/**
 * Converts an OfferItem into a standard Product representation
 * so it can be passed uniformly into ProductCard, Cart, and PDP components.
 */
export function offerItemToProduct(
  item: OfferItem,
  price?: ProductPriceStock
): Product {
  return {
    id: item.id,
    product_sku: item.id.slice(0, 8).toUpperCase(),
    package: "",
    barcode: "",
    brand: item.brand,
    manufacturer: item.brand,
    country: "O'zbekiston",
    video_url: "",
    main_picture: item.main_picture,
    gallery: [item.main_picture],
    updated_at: item.Offer_start_time,
    uz: {
      unit_uz: "dona",
      category_uz: item.group_uz || "Kanselyariya",
      category_slug_uz: item.group_slug_uz || "kanselyariya",
      alt_picture_uz: item.alt_picture_uz || item.name_uz,
      name_uz: item.name_uz,
      slug_uz: item.slug_uz,
      title_uz: `${item.name_uz} — Sora.uz da eng yaxshi narxda`,
      meta_description_uz: `${item.name_uz} mahsulotini arzon narxda kafolat bilan xarid qiling.`,
      short_description_uz: item.name_uz,
      product_description_uz: `${item.name_uz} — rasmiy kafolatlangan tovar.`,
    },
    ru: {
      unit_ru: "шт",
      category_ru: item.group_ru || "Канцелярия",
      category_slug_ru: item.group_slug_ru || "kancelyariya",
      alt_picture_ru: item.alt_picture_ru || item.name_ru,
      name_ru: item.name_ru,
      slug_ru: item.slug_ru,
      title_ru: `${item.name_ru} — купить по лучшей цене в Sora.uz`,
      meta_description_ru: `Купить ${item.name_ru} по выгодной цене с гарантией в Ташкенте.`,
      short_description_ru: item.name_ru,
      product_description_ru: `${item.name_ru} — официальный сертифицированный товар.`,
    },
    attributes: [],
    related_products: [],
    recommended_products: [],
    price: price,
  };
}

export function getOfferLocalized(
  item: OfferItem,
  locale: "uz" | "ru" = "uz"
) {
  const isUz = locale === "uz";
  return {
    name: isUz ? item.name_uz : item.name_ru,
    slug: isUz ? item.slug_uz : item.slug_ru,
    group: isUz ? item.group_uz : item.group_ru,
    groupSlug: isUz ? item.group_slug_uz : item.group_slug_ru,
    altPicture: isUz ? item.alt_picture_uz : item.alt_picture_ru,
  };
}
