"use client";

import { Product, getProductLocalized } from "@/lib/schemas/product";
import { calculateProductPrice } from "@/lib/utils/price";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { Heart, ShoppingCart, Check, Star } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  rating?: number;
  reviewCount?: number;
  oldPrice?: number;
  badge?: string;
}

export function ProductCard({
  product,
  rating,
  reviewCount,
  oldPrice: propOldPrice,
  badge,
}: ProductCardProps) {
  const locale = useLocale() as "uz" | "ru";
  const t = useTranslations("common");

  const { addItem, hasItem } = useCartStore();
  const { toggleFavorite, isFavorite } = useFavoritesStore();

  const [addedAnim, setAddedAnim] = useState(false);

  const loc = getProductLocalized(product, locale);
  const inCart = hasItem(product.id);
  const isFav = isFavorite(product.id);

  const priceInfo = calculateProductPrice(product.price);
  const price = priceInfo.price;
  const oldPrice = propOldPrice ?? priceInfo.oldPrice;
  const isOutOfStock = product.price?.stock === "OutOfStock";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || price <= 0) return;

    addItem({
      id: product.id,
      sku: product.product_sku,
      name: loc.name,
      price: price,
      picture: product.main_picture,
      unit: loc.unit,
    });

    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  const productUrl = `/products/${loc.slug}`;

  return (
    <article className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 flex flex-col justify-between hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200">
      {/* Top Media & Badges */}
      <div className="relative w-full aspect-square bg-slate-50 dark:bg-slate-800/60 rounded-xl overflow-hidden mb-3.5 flex items-center justify-center p-3">
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 items-start">
          {badge && (
            <span className="px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-md bg-amber-500 text-white shadow-xs">
              {badge}
            </span>
          )}
          {priceInfo.hasDiscount && priceInfo.discountPercent > 0 && (
            <span className="px-2 py-0.5 text-[11px] font-bold tracking-wider rounded-md bg-rose-500 text-white shadow-xs">
              -{priceInfo.discountPercent}%
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-rose-500 text-white">
              {t("outOfStock")}
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          aria-label={t("favorites")}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-xs ${
            isFav
              ? "bg-rose-50 text-rose-500 dark:bg-rose-950/60"
              : "bg-white/80 dark:bg-slate-900/80 text-slate-400 hover:text-rose-500"
          }`}
        >
          <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
        </button>

        {/* Image with crawlable Link */}
        <Link href={productUrl} className="relative w-full h-full block">
          <Image
            src={product.main_picture}
            alt={loc.alt_picture || loc.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Brand */}
          <div className="text-[11px] font-medium text-blue-600 dark:text-blue-400 tracking-wide uppercase mb-1">
            {product.brand}
          </div>

          {/* Product Name (Crawlable Link!) */}
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <Link href={productUrl} className="focus:outline-hidden">
              {loc.name}
            </Link>
          </h3>

          {/* Rating (Render only if present, prevent undefined) */}
          {typeof rating === "number" && rating > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
              <div className="flex items-center text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {rating.toFixed(1)}
              </span>
              {typeof reviewCount === "number" && (
                <span className="text-[11px] text-slate-400">
                  ({reviewCount})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
          <div className="flex flex-col">
            {oldPrice && oldPrice > price && (
              <span className="text-xs text-slate-400 line-through">
                {oldPrice.toLocaleString()} {t("currency")}
              </span>
            )}
            {price > 0 ? (
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {price.toLocaleString()}{" "}
                <span className="text-xs font-normal text-slate-500">
                  {t("currency")}
                </span>
              </div>
            ) : (
              <div className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                {locale === "uz" ? "Narxi kelishiladi" : "Цена по запросу"}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || price <= 0}
            aria-label={inCart ? t("inCart") : t("addToCart")}
            className={`h-9 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold transition-all duration-200 shadow-xs ${
              isOutOfStock || price <= 0
                ? "bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800"
                : inCart || addedAnim
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
            }`}
          >
            {addedAnim || inCart ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t("inCart")}</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t("addToCart")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
