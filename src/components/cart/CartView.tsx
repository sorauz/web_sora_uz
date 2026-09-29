"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useTranslations } from "next-intl";
import { CartItemRow } from "./CartItemRow";
import { CartSummary } from "./CartSummary";
import { CartEmptyState } from "./CartEmptyState";
import { Trash2 } from "lucide-react";

export function CartView() {
  const t = useTranslations("cart");
  const { items, clearCart, getTotalPrice, getTotalItems } = useCartStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return <CartEmptyState />;
  }

  const subtotal = getTotalPrice();
  const totalItemsCount = getTotalItems();

  const handleClearCart = () => {
    if (window.confirm(t("clearConfirm"))) {
      clearCart();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left: Cart items list (8 cols) */}
      <div className="lg:col-span-8 space-y-4">
        {/* Header row: title and clear button */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t("title")}
            </h1>
            <span className="text-sm font-semibold text-slate-500">
              ({totalItemsCount} {t("itemsCount")})
            </span>
          </div>

          <button
            type="button"
            onClick={handleClearCart}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t("clearCart")}</span>
          </button>
        </div>

        {/* Items rows */}
        <div className="space-y-3">
          {items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Right: Order summary sidebar (4 cols) */}
      <div className="lg:col-span-4">
        <CartSummary subtotal={subtotal} />
      </div>
    </div>
  );
}
