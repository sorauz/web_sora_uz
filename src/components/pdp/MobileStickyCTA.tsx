"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { Product, getProductLocalized } from "@/lib/schemas/product";
import { calculateProductPrice } from "@/lib/utils/price";

interface MobileStickyCTAProps {
  product: Product;
  locale: "uz" | "ru";
}

export function MobileStickyCTA({ product, locale }: MobileStickyCTAProps) {
  const t = useTranslations("pdp");
  const common = useTranslations("common");
  const loc = getProductLocalized(product, locale);
  const addItem = useCartStore((state) => state.addItem);

  const [isAdded, setIsAdded] = useState(false);
  const priceInfo = calculateProductPrice(product.price);
  const priceVal = priceInfo.price;
  const isOutOfStock = product.price?.stock === "OutOfStock";
  const canAddToCart = !isOutOfStock && priceVal > 0;

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    addItem(
      {
        id: product.id,
        sku: product.product_sku,
        name: loc.name,
        price: priceVal,
        picture: product.main_picture,
        unit: loc.unit,
      },
      1
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 shadow-lg">
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-800 p-1 shrink-0 overflow-hidden">
            <Image
              src={product.main_picture}
              alt={loc.name}
              fill
              sizes="44px"
              className="object-contain"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {loc.name}
            </h4>
            {priceVal > 0 ? (
              <div className="text-sm font-extrabold text-sora-600 dark:text-sora-400">
                {priceVal.toLocaleString("ru-RU")} {common("currency")}
              </div>
            ) : (
              <div className="text-xs font-semibold text-sora-600 dark:text-sora-400">
                {locale === "uz" ? "Narxi kelishiladi" : "Цена по запросу"}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={!canAddToCart}
          onClick={handleAddToCart}
          className={`flex items-center justify-center gap-1.5 px-5 h-10 rounded-xl font-bold text-xs shrink-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            isAdded
              ? "bg-emerald-600 text-white"
              : "bg-sora-600 text-white active:scale-95 shadow-md shadow-sora-500/20"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4" />
              <span>{t("addedToCart")}</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>
                {isOutOfStock
                  ? common("outOfStock")
                  : priceVal <= 0
                  ? locale === "uz"
                    ? "Kelishiladi"
                    : "По запросу"
                  : t("addToCart")}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
