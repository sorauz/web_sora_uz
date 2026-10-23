"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Trash2 } from "lucide-react";
import { CartItem, useCartStore } from "@/lib/store/cart";
import { useTranslations, useLocale } from "next-intl";

interface CartItemRowProps {
  item: CartItem;
  localizationMap?: Record<
    string,
    { name_uz: string; name_ru: string; slug_uz: string; slug_ru: string }
  >;
}

export function CartItemRow({ item, localizationMap }: CartItemRowProps) {
  const locale = useLocale() as "uz" | "ru";
  const common = useTranslations("common");
  const t = useTranslations("cart");
  const { updateQuantity, removeItem } = useCartStore();

  const [inputValue, setInputValue] = useState(String(item.quantity));

  // Sync internal input state whenever item.quantity is changed outside (via + / - / bulk buttons)
  useEffect(() => {
    setInputValue(String(item.quantity));
  }, [item.quantity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanVal = e.target.value.replace(/[^0-9]/g, "");
    setInputValue(cleanVal);
    if (cleanVal !== "") {
      const num = parseInt(cleanVal, 10);
      if (num > 0) {
        updateQuantity(item.id, Math.min(num, 99999));
      }
    }
  };

  const handleInputBlur = () => {
    if (!inputValue || parseInt(inputValue, 10) <= 0) {
      setInputValue("1");
      updateQuantity(item.id, 1);
    } else {
      const num = Math.min(parseInt(inputValue, 10), 99999);
      setInputValue(String(num));
      updateQuantity(item.id, num);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  // Determine localized title and slug dynamically based on current active locale
  const mapData = localizationMap?.[item.id];
  const displayName =
    locale === "ru"
      ? mapData?.name_ru || item.name_ru || item.name
      : mapData?.name_uz || item.name_uz || item.name;

  const displaySlug =
    locale === "ru"
      ? mapData?.slug_ru || item.slug_ru || item.slug || item.id
      : mapData?.slug_uz || item.slug_uz || item.slug || item.id;

  const productHref = `/products/${displaySlug}`;

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
      {/* Product Image & Info with Clickable Link */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <Link
          href={productHref}
          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-50 dark:bg-slate-800 p-2 shrink-0 border border-slate-100 dark:border-slate-800/80 transition-transform hover:scale-105 group cursor-pointer block"
        >
          <Image
            src={item.picture || "https://i.ibb.co/qLcGdmjh/Deli-E3871.jpg"}
            alt={displayName}
            fill
            sizes="(max-width: 640px) 64px, 80px"
            className="object-contain p-1 group-hover:opacity-90 transition-opacity"
          />
        </Link>

        <div className="min-w-0 space-y-1">
          <Link href={productHref} className="group block">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-sora-600 dark:group-hover:text-sora-400 transition-colors cursor-pointer">
              {displayName}
            </h3>
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>
              {t("unitPrice")}:{" "}
              <strong className="text-slate-700 dark:text-slate-300">
                {item.price.toLocaleString("ru-RU")} {common("currency")}
              </strong>
            </span>
            <span>•</span>
            <span className="font-mono">{item.sku}</span>
          </div>
        </div>
      </div>

      {/* Quantity, Quick Add Buttons & Total Price Actions */}
      <div className="flex flex-col sm:items-end gap-2.5 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-6 w-full">
          {/* Quantity selector with Keyboard Input */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-0.5">
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-colors font-bold text-base cursor-pointer disabled:cursor-not-allowed"
            >
              -
            </button>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              aria-label={t("quantity") || "Quantity"}
              className="w-12 h-8 text-center font-bold text-sm text-slate-900 dark:text-white bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-sora-500 rounded select-all"
            />
            <button
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              aria-label="Increase quantity"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors font-bold text-base cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Total price for this line item */}
          <div className="text-right min-w-[100px] sm:min-w-[110px]">
            <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {(item.price * item.quantity).toLocaleString("ru-RU")} {common("currency")}
            </div>
          </div>

          {/* Delete item button */}
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            aria-label={t("delete")}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Bulk Batch Increment Buttons: +12, +24, +48 */}
        <div className="flex items-center gap-1.5 self-start sm:self-end">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 select-none">
            {t("quickAdd") || (locale === "ru" ? "Добавить:" : "Qo‘shish:")}
          </span>
          {[12, 24, 48].map((qty) => (
            <button
              key={qty}
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity + qty)}
              title={locale === "ru" ? `+${qty} шт` : `+${qty} dona`}
              className="px-2 py-0.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-sora-50 dark:hover:bg-sora-950/50 hover:border-sora-300 dark:hover:border-sora-600 hover:text-sora-600 dark:hover:text-sora-400 text-slate-600 dark:text-slate-300 transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              +{qty}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
