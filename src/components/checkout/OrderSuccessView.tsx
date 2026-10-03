"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/lib/store/cart";
import {
  CheckCircle2,
  Package,
  PhoneCall,
  Clock,
  ArrowRight,
  Home,
  ShoppingBag,
} from "lucide-react";

interface OrderSuccessViewProps {
  orderIdParam?: string;
  locale: "uz" | "ru";
}

interface StoredOrder {
  orderId: string;
  createdAt: string;
  fullName: string;
  phone: string;
  deliveryMethod: string;
  address?: string;
  region?: string;
  district?: string;
  paymentMethod: string;
  total: number;
}

export function OrderSuccessView({ orderIdParam, locale }: OrderSuccessViewProps) {
  const t = useTranslations("checkout");
  const common = useTranslations("common");

  const [order, setOrder] = useState<StoredOrder | null>(null);

  useEffect(() => {
    // Clear cart once order is confirmed and displayed
    useCartStore.getState().clearCart();

    try {
      const saved = localStorage.getItem("sora_last_order");
      if (saved) {
        setOrder(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  const displayOrderId = order?.orderId || orderIdParam || "SORA-849201";

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 space-y-8">
      {/* Success Hero Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-5">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-75 duration-300">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-100/80 dark:bg-emerald-950/80 dark:text-emerald-400">
            {t("orderNumber")}: {displayOrderId}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t("successTitle")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            {t("successSubtitle")}
          </p>
        </div>

        {/* Status Timeline */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 max-w-lg mx-auto">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">Qabul qilindi</span>
            </div>
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-full bg-sora-600 text-white flex items-center justify-center mx-auto animate-pulse">
                <Clock className="w-4 h-4" />
              </div>
              <span className="font-bold text-sora-600 dark:text-sora-400">Tekshirilmoqda</span>
            </div>
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Package className="w-4 h-4" />
              </div>
              <span className="text-slate-400">Yetkazilmoqda</span>
            </div>
          </div>
        </div>

        {/* Manager call notice */}
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-center gap-3 text-xs text-amber-800 dark:text-amber-300">
          <PhoneCall className="w-4 h-4 shrink-0" />
          <span>
            {locale === "uz"
              ? "Operatorimiz 15 daqiqa ichida qo'ng'iroq qilib, buyurtmani tasdiqlaydi."
              : "Наш оператор свяжется с вами в течение 15 минут для подтверждения заказа."}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>{t("backToHome")}</span>
          </Link>
          <Link
            href="/catalog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sora-600 hover:bg-sora-700 text-white font-bold text-xs shadow-md shadow-sora-500/20 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t("continueShopping")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
