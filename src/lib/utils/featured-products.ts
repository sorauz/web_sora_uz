import { Product } from "../schemas/product";
import { calculateProductPrice } from "./price";

export interface FeaturedTabGroups {
  promo: Product[];
  popular: Product[];
  newProducts: Product[];
  lowPrice: Product[];
}

export interface BuildFeaturedTabGroupsOptions {
  promotions?: Product[];
  popular?: Product[];
  newProducts?: Product[];
  lowPrice?: Product[];
}

/**
 * Intelligent deduplication and categorization helper for homepage featured products.
 * Guarantees that the 4 tabs (Promotions, Popular, New Arrivals, Low Price) showcase
 * distinct, relevant products tailored to each purchase psychology without duplication.
 */
export function buildFeaturedTabGroups(
  allProducts: Product[],
  specialOffers?: BuildFeaturedTabGroupsOptions
): FeaturedTabGroups {
  const TARGET_COUNT = 10;
  const usedIds = new Set<string>();

  const pickUnique = (candidates: Product[], max: number): Product[] => {
    const result: Product[] = [];
    for (const p of candidates) {
      if (!usedIds.has(p.id)) {
        usedIds.add(p.id);
        result.push(p);
        if (result.length >= max) break;
      }
    }
    return result;
  };

  // 1. Promotions (🔥 Aksiyalar): Chegirmali tovarlar
  let rawPromoCandidates =
    specialOffers?.promotions && specialOffers.promotions.length > 0
      ? specialOffers.promotions
      : allProducts.filter((p) => calculateProductPrice(p.price).hasDiscount);

  if (rawPromoCandidates.length < TARGET_COUNT) {
    const additional = allProducts.filter(
      (p) => (calculateProductPrice(p.price).oldPrice ?? 0) > 0
    );
    rawPromoCandidates = [...rawPromoCandidates, ...additional];
  }
  const promo = pickUnique(rawPromoCandidates, TARGET_COUNT);
  if (promo.length < TARGET_COUNT) {
    const filler = pickUnique(allProducts, TARGET_COUNT - promo.length);
    promo.push(...filler);
  }

  // 2. Low Price Guarantee (🏷️ Eng arzon narx):
  // True budget stationery sorted ascending by real price (> 0 sum, not in promo)
  let rawLowPriceCandidates: Product[] = [];
  if (specialOffers?.lowPrice && specialOffers.lowPrice.length > 0) {
    rawLowPriceCandidates = specialOffers.lowPrice.filter(
      (p) => !usedIds.has(p.id)
    );
  }
  if (rawLowPriceCandidates.length < TARGET_COUNT) {
    const sortedByPriceAsc = [...allProducts]
      .filter((p) => {
        const pr = calculateProductPrice(p.price).price;
        return pr > 0 && !usedIds.has(p.id);
      })
      .sort(
        (a, b) =>
          calculateProductPrice(a.price).price -
          calculateProductPrice(b.price).price
      );
    rawLowPriceCandidates = [...rawLowPriceCandidates, ...sortedByPriceAsc];
  }
  const lowPrice = pickUnique(rawLowPriceCandidates, TARGET_COUNT);
  if (lowPrice.length < TARGET_COUNT) {
    const filler = pickUnique(allProducts, TARGET_COUNT - lowPrice.length);
    lowPrice.push(...filler);
  }

  // 3. New Arrivals (✨ Yangi tovarlar):
  // Omborga so'nggi qo'shilgan mahsulotlar (excluding already displayed)
  let rawNewCandidates: Product[] = [];
  if (specialOffers?.newProducts && specialOffers.newProducts.length > 0) {
    rawNewCandidates = specialOffers.newProducts.filter(
      (p) => !usedIds.has(p.id)
    );
  }
  if (rawNewCandidates.length < TARGET_COUNT) {
    const reversed = [...allProducts]
      .filter((p) => !usedIds.has(p.id))
      .reverse();
    rawNewCandidates = [...rawNewCandidates, ...reversed];
  }
  const newProducts = pickUnique(rawNewCandidates, TARGET_COUNT);
  if (newProducts.length < TARGET_COUNT) {
    const filler = pickUnique(allProducts, TARGET_COUNT - newProducts.length);
    newProducts.push(...filler);
  }

  // 4. Popular / Hits (⭐ Xit tovarlar):
  // High-demand, mid-to-high segment office essentials & equipment
  let rawPopularCandidates: Product[] = [];
  if (specialOffers?.popular && specialOffers.popular.length > 0) {
    rawPopularCandidates = specialOffers.popular.filter(
      (p) => !usedIds.has(p.id)
    );
  }
  if (rawPopularCandidates.length < TARGET_COUNT) {
    const highValue = allProducts
      .filter(
        (p) =>
          !usedIds.has(p.id) &&
          calculateProductPrice(p.price).price >= 30000
      )
      .sort(
        (a, b) =>
          calculateProductPrice(b.price).price -
          calculateProductPrice(a.price).price
      );
    rawPopularCandidates = [...rawPopularCandidates, ...highValue];
  }
  if (rawPopularCandidates.length < TARGET_COUNT) {
    const remaining = allProducts.filter((p) => !usedIds.has(p.id));
    rawPopularCandidates = [...rawPopularCandidates, ...remaining];
  }
  const popular = pickUnique(rawPopularCandidates, TARGET_COUNT);
  if (popular.length < TARGET_COUNT) {
    const filler = pickUnique(allProducts, TARGET_COUNT - popular.length);
    popular.push(...filler);
  }

  return { promo, popular, newProducts, lowPrice };
}
