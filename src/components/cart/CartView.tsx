"use client";

import { useSyncExternalStore } from "react";
import { useCartStore } from "@/lib/store/cart";
import { useTranslations } from "next-intl";
import { CartItemRow } from "./CartItemRow";
import { CartSummary } from "./CartSummary";
import { CartEmptyState } from "./CartEmptyState";
import { Trash2 } from "lucide-react";

interface CartViewProps {
  localizationMap?: Record<
    string,
    { name_uz: string; name_ru: string; slug_uz: string; slug_ru: string }
  >;
}

export function CartView({ localizationMap }: CartViewProps) {
  const t = useTranslations("cart");
  const {
    items,
    clearCart,
    getTotalPrice,
    getTotalItems,
    editingKpOrderId,
    setEditingKpOrderId,
  } = useCartStore();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-sora-600 border-t-transparent rounded-full animate-spin"></div>
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
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t("clearCart")}</span>
          </button>
        </div>

        {/* Items rows */}
        {editingKpOrderId && (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-xs text-violet-800 dark:text-violet-300 font-medium">
            <span>{t("editingKpNotice")}</span>
            <button
              type="button"
              onClick={() => setEditingKpOrderId(null)}
              className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 text-violet-700 dark:text-violet-300 font-bold hover:bg-white cursor-pointer shrink-0"
            >
              {t("cancelEditKp")}
            </button>
          </div>
        )}

        <div className="space-y-3">
          {items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              localizationMap={localizationMap}
            />
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
