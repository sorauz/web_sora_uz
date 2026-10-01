/**
 * Price calculation utility for Sora.uz products.
 *
 * Business Rules based on 1C ERP price specifications:
 * 1. retail_price is the reference / catalog base price.
 * 2. wholesale_price is the actual selling / discounted price.
 * 3. If retail_price > wholesale_price:
 *    - Discount applies: show wholesale_price as active price, retail_price as struck-through oldPrice.
 *    - Calculate discount percentage: Math.round(((retail - wholesale) / retail) * 100).
 * 4. If retail_price == wholesale_price:
 *    - No discount exists: display wholesale_price as active price without oldPrice.
 * 5. If retail_price < wholesale_price:
 *    - Anomaly / wholesale higher: display wholesale_price as active price without discount / oldPrice.
 * 6. If both prices are missing, undefined, or <= 0:
 *    - Fallback: price = 0, isNegotiable = true ("Narxi kelishiladi" / "Цена по запросу").
 * 7. dealer_price is preserved for future dealer portal accounts.
 */

export interface ProductPriceInfo {
  price: number;
  oldPrice?: number;
  hasDiscount: boolean;
  discountPercent: number;
  isNegotiable: boolean;
}

export interface PriceInput {
  retail_price?: number;
  wholesale_price?: number;
  dealer_price?: number;
  currency?: string;
  [key: string]: unknown;
}

export function calculateProductPrice(
  priceData?: PriceInput | null
): ProductPriceInfo {
  const retail = Number(priceData?.retail_price) || 0;
  const wholesale = Number(priceData?.wholesale_price) || 0;

  // Case 1: Both prices missing or <= 0
  if (wholesale <= 0 && retail <= 0) {
    return {
      price: 0,
      oldPrice: undefined,
      hasDiscount: false,
      discountPercent: 0,
      isNegotiable: true,
    };
  }

  // Case 2: Only retail price is provided (> 0) and wholesale is missing/0
  if (wholesale <= 0 && retail > 0) {
    return {
      price: retail,
      oldPrice: undefined,
      hasDiscount: false,
      discountPercent: 0,
      isNegotiable: false,
    };
  }

  // Case 3: retail_price > wholesale_price => Discount applies!
  if (retail > wholesale) {
    const discountPercent = Math.round(((retail - wholesale) / retail) * 100);
    return {
      price: wholesale,
      oldPrice: retail,
      hasDiscount: true,
      discountPercent,
      isNegotiable: false,
    };
  }

  // Case 4: retail_price <= wholesale_price => No discount, show wholesale_price
  return {
    price: wholesale,
    oldPrice: undefined,
    hasDiscount: false,
    discountPercent: 0,
    isNegotiable: false,
  };
}
