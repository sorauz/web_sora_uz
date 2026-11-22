"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { ShieldCheck, Truck, ArrowRight, FileText } from "lucide-react";
import { reachGoal } from "@/lib/analytics/yandex";

const CommercialOfferModal = dynamic(
  () =>
    import("./CommercialOfferModal").then((mod) => ({
      default: mod.CommercialOfferModal,
    })),
  { ssr: false }
);

interface CartSummaryProps {
  subtotal: number;
}

export function CartSummary({ subtotal }: CartSummaryProps) {
  const t = useTranslations("cart");
  const common = useTranslations("common");
  const locale = (useLocale() === "ru" ? "ru" : "uz") as "uz" | "ru";
  const [kpModalOpen, setKpModalOpen] = useState(false);

  // Delivery rules: Free delivery if subtotal >= 500,000 UZS, otherwise 30,000 UZS
  const isFreeDelivery = subtotal >= 500000;
  const deliveryFee = isFreeDelivery ? 0 : 30000;
  const total = Math.max(0, subtotal + deliveryFee);

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

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {t("total")}
            </span>
            <div className="text-right">
              <span className="text-2xl font-black text-sora-600 dark:text-sora-400 tracking-tight">
                {total.toLocaleString("ru-RU")} {common("currency")}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-right text-emerald-600 dark:text-emerald-400 font-medium">
            {t("vatIncluded")}
          </p>
        </div>
      </div>

      {/* Checkout Button */}
      <Link
        href="/checkout"
        onClick={() => reachGoal("START_CHECKOUT", { subtotal, total })}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-sora-600 hover:bg-sora-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-sora-500/25 transition-all"
      >
        <span>{t("proceedToCheckout")}</span>
        <ArrowRight className="w-4 h-4" />
      </Link>

      {/* Commercial Offer (KP) Button */}
      <button
        type="button"
        onClick={() => {
          reachGoal("OPEN_KP_MODAL", { subtotal });
          setKpModalOpen(true);
        }}
        className="w-full flex flex-col items-center justify-center gap-0.5 py-3 px-5 rounded-2xl border-2 border-sora-200 dark:border-sora-800/70 bg-sora-50/50 dark:bg-sora-950/30 hover:bg-sora-100/70 dark:hover:bg-sora-900/40 text-sora-700 dark:text-sora-300 transition-all cursor-pointer"
      >
        <span className="flex items-center gap-2 font-bold text-sm">
          <FileText className="w-4 h-4" />
          <span>{t("downloadKp")}</span>
        </span>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {t("downloadKpHint")}
        </span>
      </button>

      {/* Trust notice */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>{t("securePayment")}</span>
      </div>

      {kpModalOpen && (
        <CommercialOfferModal
          isOpen={kpModalOpen}
          onClose={() => setKpModalOpen(false)}
          locale={locale}
        />
      )}
    </div>
  );
}
