"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/lib/store/cart";
import { OneCOrderDetailResponse } from "@/lib/schemas/order";
import { getOrderStatusUiMeta } from "@/lib/utils/order-status";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { GoogleCustomerReviewsOptIn } from "@/components/analytics/GoogleCustomerReviewsOptIn";
import {
  CheckCircle2,
  Package,
  PhoneCall,
  Clock,
  ArrowRight,
  Home,
  ShoppingBag,
  XCircle,
  Loader2,
  ClipboardList,
  MapPin,
} from "lucide-react";

interface OrderSuccessViewProps {
  orderIdParam?: string;
  orderNumberParam?: string;
  locale: "uz" | "ru";
}

interface StoredOrderItem {
  id?: string;
  gtin?: string;
}

interface StoredOrder {
  orderId: string;
  orderNumber?: string;
  createdAt: string;
  statusCode?: string;
  statusText?: string;
  posted?: boolean;
  serverMessage?: string;
  fullName: string;
  phone: string;
  email?: string;
  deliveryMethod: string;
  address?: string;
  region?: string;
  district?: string;
  paymentMethod: string;
  companyName?: string;
  companyInn?: string;
  items?: StoredOrderItem[];
  subtotal?: number;
  totalAmount1C?: number;
  deliveryFee?: number;
  total: number;
}

function computeEstimatedDeliveryDate(
  createdAtIso?: string,
  deliveryMethod?: string,
  region?: string,
): string {
  const parsed = createdAtIso ? Date.parse(createdAtIso) : Number.NaN;
  const baseMs = Number.isFinite(parsed) ? parsed : Date.now();
  const isPickup = deliveryMethod === "pickup";
  const isTashkent = !region || /toshkent|ташкент|tashkent/i.test(region);
  // Pickup & Tashkent courier: ~1 day; regional courier: ~3 days
  const daysToAdd = isPickup || isTashkent ? 1 : 3;
  // Convert to Asia/Tashkent (UTC+5) calendar date before formatting YYYY-MM-DD
  const tashkentOffsetMs = 5 * 60 * 60 * 1000;
  const target = new Date(
    baseMs + daysToAdd * 24 * 60 * 60 * 1000 + tashkentOffsetMs,
  );
  return target.toISOString().slice(0, 10);
}

function subscribeLastOrder(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getLastOrderSnapshot(): string | null {
  try {
    return localStorage.getItem("sora_last_order");
  } catch {
    return null;
  }
}

function getLastOrderServerSnapshot(): string | null {
  return null;
}

export function OrderSuccessView({
  orderIdParam,
  orderNumberParam,
  locale,
}: OrderSuccessViewProps) {
  const t = useTranslations("checkout");
  const common = useTranslations("common");
  const isUz = locale === "uz";

  const rawSavedOrder = useSyncExternalStore(
    subscribeLastOrder,
    getLastOrderSnapshot,
    getLastOrderServerSnapshot
  );

  const order = useMemo<StoredOrder | null>(() => {
    if (!rawSavedOrder) return null;
    try {
      return JSON.parse(rawSavedOrder) as StoredOrder;
    } catch {
      return null;
    }
  }, [rawSavedOrder]);

  const [liveDetail, setLiveDetail] = useState<OneCOrderDetailResponse | null>(
    null
  );
  const [statusLoadedForId, setStatusLoadedForId] = useState<string | null>(
    null
  );

  useEffect(() => {
    // Clear cart once order is saved in 1C (both posted: true and posted: false)
    useCartStore.getState().clearCart();
  }, []);

  const displayOrderId = order?.orderId || orderIdParam || "SORA-849201";
  const displayOrderNumber =
    liveDetail?.order_number ||
    order?.orderNumber ||
    orderNumberParam ||
    displayOrderId;
  const loadingStatus = Boolean(
    displayOrderId && statusLoadedForId !== displayOrderId
  );

  useEffect(() => {
    if (!displayOrderId) return;

    let isMounted = true;

    fetch(`/api/order/status?orderId=${encodeURIComponent(displayOrderId)}`)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (isMounted && ok && data.success && data.order && !data.isFallback) {
          setLiveDetail(data.order as OneCOrderDetailResponse);
        }
      })
      .catch(() => {
        // Keep initial POST /order status
      })
      .finally(() => {
        if (isMounted) setStatusLoadedForId(displayOrderId);
      });

    return () => {
      isMounted = false;
    };
  }, [displayOrderId]);

  const withoutDelivery =
    liveDetail?.delivery?.without_delivery ??
    (order?.deliveryMethod === "pickup");

  const statusMeta = getOrderStatusUiMeta(
    {
      statusCode: liveDetail?.status_code ?? order?.statusCode,
      statusText: liveDetail?.status ?? order?.statusText,
      posted: liveDetail?.posted ?? order?.posted,
      withoutDelivery,
    },
    locale
  );

  const estimatedDeliveryDate = useMemo(
    () =>
      computeEstimatedDeliveryDate(
        order?.createdAt,
        order?.deliveryMethod,
        order?.region,
      ),
    [order?.createdAt, order?.deliveryMethod, order?.region],
  );

  const gcrGtins = useMemo(
    () =>
      (order?.items ?? [])
        .map((item) => item.gtin)
        .filter((gtin): gtin is string => Boolean(gtin)),
    [order?.items],
  );

  const heroTitle = statusMeta.isCancelled
    ? isUz
      ? "Buyurtma bekor qilingan"
      : "Заказ отменён"
    : statusMeta.isPending
    ? isUz
      ? "Buyurtmangiz qabul qilindi!"
      : "Ваш заказ принят!"
    : isUz
    ? "Buyurtmangiz qabul qilindi va tasdiqlandi!"
    : "Ваш заказ принят и подтверждён!";

  const heroSubtitle =
    order?.serverMessage ||
    (statusMeta.isPending
      ? isUz
        ? "Buyurtma 1C tizimiga saqlandi va menejer tekshiruviga yuborildi."
        : "Заказ сохранён в 1С и направлен на проверку менеджеру."
      : t("successSubtitle"));

  const liveProductsTotal =
    liveDetail && typeof liveDetail.total_amount === "number"
      ? liveDetail.total_amount
      : undefined;
  const productsSubtotal =
    liveProductsTotal ?? order?.totalAmount1C ?? order?.subtotal ?? order?.total ?? 0;
  const deliveryFee = order?.deliveryFee ?? 0;
  const grandTotal =
    liveProductsTotal !== undefined
      ? liveProductsTotal + deliveryFee
      : order?.totalAmount1C !== undefined
      ? order.totalAmount1C + deliveryFee
      : order?.total ?? 0;

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 space-y-8">
      {/* Success Hero Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-5">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-75 duration-300 ${
            statusMeta.isCancelled
              ? "bg-rose-50 dark:bg-rose-950/60 text-rose-500"
              : statusMeta.isPending
              ? "bg-amber-50 dark:bg-amber-950/60 text-amber-500"
              : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500"
          }`}
        >
          {statusMeta.isCancelled ? (
            <XCircle className="w-12 h-12" />
          ) : statusMeta.isPending ? (
            <Clock className="w-12 h-12" />
          ) : (
            <CheckCircle2 className="w-12 h-12" />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${statusMeta.badgeClassName}`}
            >
              {t("orderNumber")}: {displayOrderNumber}
            </span>
            {displayOrderId !== displayOrderNumber && (
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400">
                1C ID: {displayOrderId.slice(0, 18)}...
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {heroTitle}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            {heroSubtitle}
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-500">
              {isUz ? "1C Buyurtma holati:" : "Статус заказа в 1С:"}
            </span>
            <span
              className={`font-bold flex items-center gap-1 ${statusMeta.textClassName}`}
            >
              {loadingStatus ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : statusMeta.isCancelled ? (
                <XCircle className="w-3.5 h-3.5" />
              ) : statusMeta.isConfirmedLike ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              <span>{statusMeta.label}</span>
            </span>
          </div>
        </div>

        {/* Dynamic 1C Timeline (when fetched) or Fallback 3-step summary */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-left">
          {liveDetail && liveDetail.timeline.length > 0 ? (
            <OrderTimeline
              timeline={liveDetail.timeline}
              statusCode={liveDetail.status_code}
              withoutDelivery={withoutDelivery}
              locale={locale}
            />
          ) : (
            <div className="max-w-lg mx-auto grid grid-cols-3 gap-2 text-center text-xs">
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
                    statusMeta.isCancelled
                      ? "bg-rose-600 text-white"
                      : statusMeta.isConfirmedLike
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-500 text-white animate-pulse"
                  }`}
                >
                  {statusMeta.isCancelled ? (
                    <XCircle className="w-4 h-4" />
                  ) : statusMeta.isConfirmedLike ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`font-bold ${
                    statusMeta.isCancelled
                      ? "text-rose-600 dark:text-rose-400"
                      : statusMeta.isConfirmedLike
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {statusMeta.shortLabel}
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
          )}
        </div>

        {/* Manager call / no-retry reassurance notice */}
        <div
          className={`p-4 rounded-2xl border flex items-center justify-center gap-3 text-xs ${
            statusMeta.isPending
              ? "bg-amber-50/80 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-900/50 text-amber-800 dark:text-amber-300"
              : "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300"
          }`}
        >
          <PhoneCall className="w-4 h-4 shrink-0" />
          <span>
            {statusMeta.isPending
              ? isUz
                ? "Buyurtmangiz 1C tizimiga saqlandi — qayta buyurtma berish shart emas, menejerimiz tez orada bog'lanadi."
                : "Ваш заказ сохранён в системе 1С — повторно оформлять заказ не нужно, наш менеджер скоро свяжется с вами."
              : isUz
              ? "Operatorimiz 15 daqiqa ichida qo'ng'iroq qilib, yetkazib berish tafsilotlarini aniqlashtiradi."
              : "Наш оператор свяжется с вами в течение 15 минут для уточнения деталей доставки."}
          </span>
        </div>

        {/* Pickup point from 1C if available */}
        {withoutDelivery && liveDetail?.delivery?.pickup_point && (
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-xs text-slate-700 dark:text-slate-200">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{liveDetail.delivery.pickup_point}</span>
          </div>
        )}

        {/* Order Details summary (uses 1C official total_amount + separate delivery fee) */}
        {(order || liveDetail) && (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-left text-xs space-y-2.5">
            <div className="font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700">
              {isUz ? "Buyurtma parametrlari" : "Параметры заказа"}
            </div>
            {order && (
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>{isUz ? "Mijoz:" : "Клиент:"}</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {order.fullName} ({order.phone})
                </span>
              </div>
            )}
            {order?.companyName && (
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>{isUz ? "Korxona (B2B):" : "Организация:"}</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {order.companyName} (STIR: {order.companyInn})
                </span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>{isUz ? "Yetkazib berish:" : "Доставка:"}</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {withoutDelivery
                  ? isUz
                    ? "Do'kondan olib ketish"
                    : "Самовывоз"
                  : isUz
                  ? "Kuryer orqali yetkazish"
                  : "Курьерская доставка"}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>
                {isUz ? "Mahsulotlar summasi (1C):" : "Сумма товаров (1С):"}
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {productsSubtotal.toLocaleString("ru-RU")} {common("currency")}
              </span>
            </div>
            {order?.deliveryFee !== undefined && (
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>
                  {isUz ? "Yetkazib berish haqi:" : "Стоимость доставки:"}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {deliveryFee === 0
                    ? isUz
                      ? "Bepul"
                      : "Бесплатно"
                    : `${deliveryFee.toLocaleString("ru-RU")} ${common("currency")}`}
                </span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700 font-bold">
              <span>{isUz ? "Jami summa:" : "Итоговая сумма:"}</span>
              <span className="text-sora-600 dark:text-sora-400 text-sm">
                {grandTotal.toLocaleString("ru-RU")} {common("currency")}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={
              displayOrderId && displayOrderId !== "SORA-849201"
                ? `/orders?orderId=${encodeURIComponent(displayOrderId)}`
                : "/orders"
            }
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            <span>
              {displayOrderNumber && displayOrderNumber !== "SORA-849201"
                ? isUz
                  ? `Buyurtma holatini kuzatish (#${displayOrderNumber})`
                  : `Отслеживать заказ (#${displayOrderNumber})`
                : isUz
                ? "Mening buyurtmalarim"
                : "Мои заказы"}
            </span>
          </Link>
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

      {order && !statusMeta.isCancelled && (
        <GoogleCustomerReviewsOptIn
          orderId={displayOrderNumber}
          email={order.email}
          estimatedDeliveryDate={estimatedDeliveryDate}
          gtins={gcrGtins}
          locale={locale}
        />
      )}
    </div>
  );
}
