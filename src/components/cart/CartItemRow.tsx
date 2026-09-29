"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Trash2 } from "lucide-react";
import { CartItem, useCartStore } from "@/lib/store/cart";
import { useTranslations } from "next-intl";

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const common = useTranslations("common");
  const t = useTranslations("cart");
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
      {/* Product Image & Info */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-50 dark:bg-slate-800 p-2 shrink-0 border border-slate-100 dark:border-slate-800/80">
          <Image
            src={item.picture || "https://i.ibb.co/qLcGdmjh/Deli-E3871.jpg"}
            alt={item.name}
            fill
            className="object-contain p-1"
            unoptimized
          />
        </div>

        <div className="min-w-0 space-y-1">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
            {item.name}
          </h3>
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

      {/* Quantity & Total Price Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
        {/* Quantity selector */}
        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-0.5">
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-colors font-bold text-base"
          >
            -
          </button>
          <span className="w-10 text-center font-bold text-sm text-slate-900 dark:text-white">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors font-bold text-base"
          >
            +
          </button>
        </div>

        {/* Total price for this line item */}
        <div className="text-right min-w-[110px]">
          <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {(item.price * item.quantity).toLocaleString("ru-RU")} {common("currency")}
          </div>
        </div>

        {/* Delete item button */}
        <button
          type="button"
          onClick={() => removeItem(item.id)}
          aria-label={t("delete")}
          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
