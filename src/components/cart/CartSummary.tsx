"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ShieldCheck, Truck, ArrowRight, Tag, CheckCircle2 } from "lucide-react";

interface CartSummaryProps {
  subtotal: number;
}

export function CartSummary({ subtotal }: CartSummaryProps) {
  const t = useTranslations("cart");
  const common = useTranslations("common");

  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState(false);

  // Delivery rules: Free delivery if subtotal >= 500,000 UZS, otherwise 30,000 UZS
  const isFreeDelivery = subtotal >= 500000;
  const deliveryFee = isFreeDelivery ? 0 : 30000;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "SORA10" || promoCode.trim().toUpperCase() === "SORA") {
      setDiscountPercent(10);
      setPromoApplied(true);
      setPromoError(false);
    } else {
      setPromoError(true);
      setTimeout(() => setPromoError(false), 2500);
    }
  };

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs sticky top-24">
      <h2 className="text-lg font-black text-slate-900 dark:text-white">
        {t("orderSummary")}
      </h2>

      {/* Free Delivery Progress Banner */}
      <div className="p-3.5 rounded-2xl bg-sora-50/70 dark:bg-sora-950/40 border border-sora-100 dark:border-sora-900/40 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-sora-700 dark:text-sora-300">
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-sora-600 dark:text-sora-400" />
            {isFreeDelivery ? t("freeDelivery") : t("delivery")}
          </span>
          <span>
            {isFreeDelivery
              ? "0 " + common("currency")
              : (500000 - subtotal).toLocaleString("ru-RU") + " " + common("currency") + " qoldi"}
          </span>
        </div>
        <div className="h-2 bg-sora-200/60 dark:bg-sora-900/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-sora-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.round((subtotal / 500000) * 100))}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
          {t("freeDeliveryNotice")}
        </p>
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span>{t("subtotal")}</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {subtotal.toLocaleString("ru-RU")} {common("currency")}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span>{t("promoCode")} ({discountPercent}%)</span>
            <span className="font-bold">
              -{discountAmount.toLocaleString("ru-RU")} {common("currency")}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span>{t("delivery")}</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {deliveryFee === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {t("freeDelivery")}
              </span>
            ) : (
              `${deliveryFee.toLocaleString("ru-RU")} ${common("currency")}`
            )}
          </span>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-baseline justify-between">
          <span className="text-base font-bold text-slate-900 dark:text-white">
            {t("total")}
          </span>
          <div className="text-right">
            <span className="text-2xl font-black text-sora-600 dark:text-sora-400 tracking-tight">
              {total.toLocaleString("ru-RU")} {common("currency")}
            </span>
          </div>
        </div>
      </div>

      {/* Promo Code Form */}
      <form onSubmit={handleApplyPromo} className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="SORA10"
              disabled={promoApplied}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs uppercase font-semibold focus:outline-none focus:ring-2 focus:ring-sora-500 disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={promoApplied || !promoCode.trim()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-40"
          >
            {promoApplied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : t("applyPromo")}
          </button>
        </div>
        {promoError && (
          <p className="text-[11px] text-rose-500 font-medium">
            Promokod noto&apos;g&apos;ri yoki muddati tugagan.
          </p>
        )}
        {promoApplied && (
          <p className="text-[11px] text-emerald-600 font-medium">
            10% chegirma muvaffaqiyatli qo&apos;llandi!
          </p>
        )}
      </form>

      {/* Checkout Button */}
      <Link
        href="/checkout"
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-sora-600 hover:bg-sora-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-sora-500/25 transition-all"
      >
        <span>{t("proceedToCheckout")}</span>
        <ArrowRight className="w-4 h-4" />
      </Link>

      {/* Trust notice */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>{t("securePayment")}</span>
      </div>
    </div>
  );
}
