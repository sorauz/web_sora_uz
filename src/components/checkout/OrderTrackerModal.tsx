"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@/i18n/routing";
import { useAuthStore } from "@/lib/store/auth";
import { OneCOrderDetailResponse } from "@/lib/schemas/order";
import {
  formatOrderDate,
  getOrderStatusUiMeta,
} from "@/lib/utils/order-status";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import {
  Search,
  X,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  AlertCircle,
  LogIn,
  ClipboardList,
} from "lucide-react";

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale?: "uz" | "ru";
}

export function OrderTrackerModal({
  isOpen,
  onClose,
  locale = "uz",
}: OrderTrackerModalProps) {
  const isUz = locale === "uz";
  const { user, openModal } = useAuthStore();

  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<OneCOrderDetailResponse | null>(null);

  if (!isOpen) return null;

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(
        `/api/order/status?orderId=${encodeURIComponent(orderId.trim())}`
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          setError(
            data.error ||
              (isUz
                ? "Buyurtmani ko'rish uchun tizimga kiring"
                : "Войдите в аккаунт для просмотра заказа")
          );
        } else if (res.status === 403) {
          setError(
            data.error ||
              (isUz
                ? "Ushbu buyurtma sizning hisobingizga tegishli emas"
                : "Этот заказ не принадлежит вашему аккаунту")
          );
        } else {
          setError(
            data.error || (isUz ? "Buyurtma topilmadi" : "Заказ не найден")
          );
        }
      } else if (data.order) {
        setResult(data.order as OneCOrderDetailResponse);
      }
    } catch {
      setError(
        isUz ? "Tarmoq xatosi yuz berdi" : "Произошла сетевая ошибка"
      );
    } finally {
      setLoading(false);
    }
  };

  const withoutDelivery = result?.delivery?.without_delivery ?? false;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-sora-600 dark:text-sora-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isUz ? "Buyurtma holatini tekshirish" : "Проверить статус заказа"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!user ? (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {isUz
                ? "1C buyurtmangiz holatini tekshirish uchun telefon raqamingiz orqali tizimga kiring."
                : "Войдите по номеру телефона, чтобы проверить статус вашего заказа в 1С."}
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                openModal({ tab: "login" });
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sora-600 hover:bg-sora-700 text-white text-xs font-bold cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isUz ? "Tizimga kirish" : "Войти в аккаунт"}</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleTrack} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {isUz
                ? "1C Buyurtma ID (GUID) raqamini kiriting:"
                : "Введите ID заказа (GUID) из 1С:"}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e44c21a0-318a-11e8-812c-d43d7e011714"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full h-11 pl-4 pr-11 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sora-500 font-mono"
              />
              <button
                type="submit"
                disabled={loading || !orderId.trim()}
                className="absolute right-1.5 top-1.5 w-8 h-8 rounded-lg bg-sora-600 hover:bg-sora-700 text-white flex items-center justify-center disabled:opacity-40 transition-colors cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result &&
          (() => {
            const statusMeta = getOrderStatusUiMeta(
              {
                statusCode: result.status_code,
                statusText: result.status,
                posted: result.posted,
                withoutDelivery,
              },
              locale
            );

            return (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3.5 animate-in fade-in zoom-in-95 duration-200 text-xs">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white shrink-0">
                    {result.order_number}
                  </span>
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1 ${statusMeta.badgeClassName}`}
                  >
                    {statusMeta.isCancelled ? (
                      <XCircle className="w-3 h-3 shrink-0" />
                    ) : statusMeta.isConfirmedLike ? (
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                    ) : (
                      <Clock className="w-3 h-3 shrink-0" />
                    )}
                    <span>{statusMeta.label}</span>
                  </span>
                </div>

                {result.timeline && result.timeline.length > 0 && (
                  <OrderTimeline
                    timeline={result.timeline}
                    statusCode={result.status_code}
                    withoutDelivery={withoutDelivery}
                    locale={locale}
                    compact
                  />
                )}

                <div className="space-y-1.5 text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-700">
                  {result.order_date && (
                    <div className="flex justify-between">
                      <span>{isUz ? "Sana:" : "Дата:"}</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formatOrderDate(result.order_date, locale)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{isUz ? "Yetkazib berish:" : "Доставка:"}</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {withoutDelivery
                        ? isUz
                          ? "Do'kondan olib ketish"
                          : "Самовывоз"
                        : isUz
                        ? "Kuryer orqali"
                        : "Курьер"}
                    </span>
                  </div>
                  {withoutDelivery && result.delivery.pickup_point && (
                    <div className="flex justify-between gap-2">
                      <span>{isUz ? "Olib ketish nuqtasi:" : "Пункт:"}</span>
                      <span className="font-medium text-right text-slate-900 dark:text-white">
                        {result.delivery.pickup_point}
                      </span>
                    </div>
                  )}
                  {result.products && result.products.length > 0 && (
                    <div className="flex justify-between">
                      <span>{isUz ? "Tarkib:" : "Состав:"}</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {result.products.length} {isUz ? "ta mahsulot" : "поз."}
                      </span>
                    </div>
                  )}
                  {result.total_amount > 0 && (
                    <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 font-bold">
                      <span>{isUz ? "Jami summa:" : "Сумма:"}</span>
                      <span className="text-sora-600 dark:text-sora-400">
                        {result.total_amount.toLocaleString("ru-RU")} UZS
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

        {user && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-center">
            <Link
              href="/orders"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sora-600 dark:text-sora-400 hover:underline"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>
                {isUz
                  ? "Barcha buyurtmalarimni ko'rish"
                  : "Открыть все мои заказы"}
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
