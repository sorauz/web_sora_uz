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
  AlertCircle,
  XCircle,
  Truck,
  Building2,
} from "lucide-react";

interface OrderSuccessViewProps {
  orderIdParam?: string;
  orderNumberParam?: string;
  locale: "uz" | "ru";
}

interface StoredOrder {
  orderId: string;
  orderNumber?: string;
  createdAt: string;
  fullName: string;
  phone: string;
  deliveryMethod: string;
  address?: string;
  region?: string;
  district?: string;
  paymentMethod: string;
  companyName?: string;
  companyInn?: string;
  total: number;
}

export function OrderSuccessView({
  orderIdParam,
  orderNumberParam,
  locale,
}: OrderSuccessViewProps) {
  const t = useTranslations("checkout");
  const common = useTranslations("common");
  const isUz = locale === "uz";

  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [liveStatus, setLiveStatus] = useState<string>("Jarayonda");
  const [loadingStatus, setLoadingStatus] = useState(false);

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
  const displayOrderNumber =
    order?.orderNumber || orderNumberParam || displayOrderId;

  useEffect(() => {
    if (!displayOrderId) return;

    let isMounted = true;
    setLoadingStatus(true);

    fetch(`/api/order/status?orderId=${encodeURIComponent(displayOrderId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.order?.status) {
          setLiveStatus(data.order.status);
        }
      })
      .catch(() => {
        // Fallback default
      })
      .finally(() => {
        if (isMounted) setLoadingStatus(false);
      });

    return () => {
      isMounted = false;
    };
  }, [displayOrderId]);

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 space-y-8">
      {/* Success Hero Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-5">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-75 duration-300">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-100/80 dark:bg-emerald-950/80 dark:text-emerald-400">
              {t("orderNumber")}: {displayOrderNumber}
            </span>
            {displayOrderId !== displayOrderNumber && (
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400">
                1C ID: {displayOrderId.slice(0, 18)}...
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t("successTitle")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            {t("successSubtitle")}
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-500">{isUz ? "1C Buyurtma holati:" : "Статус заказа в 1С:"}</span>
            {liveStatus === "Tasdiqlangan" ? (
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isUz ? "Tasdiqlangan (O'tkazilgan)" : "Подтвержден"}
              </span>
            ) : liveStatus === "Bekor qilingan" ? (
              <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                {isUz ? "Bekor qilingan" : "Отменен"}
              </span>
            ) : (
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                {isUz ? "Jarayonda (Ko'rib chiqilmoqda)" : "В обработке"}
              </span>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 max-w-lg mx-auto">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">
                {isUz ? "Qabul qilindi" : "Принят"}
              </span>
            </div>
            <div className="space-y-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                  liveStatus === "Tasdiqlangan"
                    ? "bg-emerald-600 text-white"
                    : "bg-sora-600 text-white animate-pulse"
                }`}
              >
                <Clock className="w-4 h-4" />
              </div>
              <span
                className={`font-bold ${
                  liveStatus === "Tasdiqlangan"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-sora-600 dark:text-sora-400"
                }`}
              >
                {liveStatus === "Tasdiqlangan"
                  ? isUz
                    ? "Tasdiqlandi"
                    : "Подтвержден"
                  : isUz
                  ? "Tekshirilmoqda"
                  : "Проверяется"}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Package className="w-4 h-4" />
              </div>
              <span className="text-slate-400">
                {isUz ? "Yetkazilmoqda" : "Доставляется"}
              </span>
            </div>
          </div>
        </div>

        {/* Manager call notice */}
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-center gap-3 text-xs text-amber-800 dark:text-amber-300">
          <PhoneCall className="w-4 h-4 shrink-0" />
          <span>
            {isUz
              ? "Operatorimiz 15 daqiqa ichida qo'ng'iroq qilib, buyurtmani tasdiqlaydi."
              : "Наш оператор свяжется с вами в течение 15 минут для подтверждения заказа."}
          </span>
        </div>

        {/* Order Details summary if available */}
        {order && (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-left text-xs space-y-2.5">
            <div className="font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700">
              {isUz ? "Buyurtma parametrlari" : "Параметры заказа"}
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>{isUz ? "Mijoz:" : "Клиент:"}</span>
              <span className="font-semibold text-slate-900 dark:text-white">{order.fullName} ({order.phone})</span>
            </div>
            {order.companyName && (
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>{isUz ? "Korxona (B2B):" : "Организация:"}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{order.companyName} (STIR: {order.companyInn})</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>{isUz ? "Yetkazib berish:" : "Доставка:"}</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {order.deliveryMethod === "pickup"
                  ? isUz ? "Do'kondan olib ketish" : "Самовывоз"
                  : isUz ? "Kuryer orqali yetkazish" : "Курьерская доставка"}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700 font-bold">
              <span>{isUz ? "Jami summa:" : "Итоговая сумма:"}</span>
              <span className="text-sora-600 dark:text-sora-400 text-sm">
                {order.total.toLocaleString("ru-RU")} {common("currency")}
              </span>
            </div>
          </div>
        )}

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
