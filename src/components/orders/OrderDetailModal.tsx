"use client";

import { createPortal } from "react-dom";
import { OneCOrderDetailResponse } from "@/lib/schemas/order";
import {
  formatOrderDate,
  getOrderStatusUiMeta,
} from "@/lib/utils/order-status";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import {
  X,
  Truck,
  Store,
  MapPin,
  CreditCard,
  Building2,
  User,
  Phone,
  MessageSquare,
  Package,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OneCOrderDetailResponse | null;
  loading: boolean;
  error: string;
  locale: "uz" | "ru";
}

export function OrderDetailModal({
  isOpen,
  onClose,
  order,
  loading,
  error,
  locale,
}: OrderDetailModalProps) {
  const isUz = locale === "uz";

  if (!isOpen) return null;

  const withoutDelivery = order?.delivery?.without_delivery ?? false;
  const statusMeta = order
    ? getOrderStatusUiMeta(
        {
          statusCode: order.status_code,
          statusText: order.status,
          posted: order.posted,
          withoutDelivery,
        },
        locale
      )
    : null;

  const geolocationValue = order?.delivery?.geolocation?.trim() || "";
  const geoHref = geolocationValue
    ? geolocationValue.startsWith("http")
      ? geolocationValue
      : `https://maps.google.com/maps?q=${encodeURIComponent(geolocationValue)}`
    : null;

  const paymentLabel =
    order?.payment_type === "TRANSFER"
      ? isUz
        ? "Pul o'tkazish (Bank)"
        : "Безналичный расчёт (перечисление)"
      : isUz
      ? "Naqd pul yoki karta"
      : "Наличными или картой";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {order
                  ? `${isUz ? "Buyurtma" : "Заказ"} #${order.order_number}`
                  : isUz
                  ? "Buyurtma tafsiloti"
                  : "Детали заказа"}
              </h2>
              {statusMeta && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusMeta.badgeClassName}`}
                >
                  {statusMeta.label}
                </span>
              )}
              {order && !order.online && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {isUz ? "Oflayn xarid" : "Офлайн покупка"}
                </span>
              )}
            </div>
            {order?.order_date && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatOrderDate(order.order_date, locale)}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500 text-sm">
            <Loader2 className="w-7 h-7 animate-spin text-sora-600" />
            <span>{isUz ? "Ma'lumotlar yuklanmoqda..." : "Загрузка данных..."}</span>
          </div>
        )}

        {!loading && error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && order && (
          <div className="space-y-6">
            {/* Dynamic 1C Timeline */}
            {order.timeline.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isUz ? "Bajarilish bosqichlari" : "Этапы выполнения"}
                </h3>
                <OrderTimeline
                  timeline={order.timeline}
                  statusCode={order.status_code}
                  withoutDelivery={withoutDelivery}
                  locale={locale}
                />
              </div>
            )}

            {/* Delivery, Payment & Customer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 space-y-2.5">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {withoutDelivery ? (
                    <Store className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Truck className="w-4 h-4 text-sora-600" />
                  )}
                  <span>
                    {withoutDelivery
                      ? isUz
                        ? "Samovivoz (O'zi olib ketish)"
                        : "Самовывоз"
                      : isUz
                      ? "Kuryer orqali yetkazib berish"
                      : "Курьерская доставка"}
                  </span>
                </div>

                {withoutDelivery && order.delivery.pickup_point && (
                  <p className="text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                    <span>{order.delivery.pickup_point}</span>
                  </p>
                )}

                {!withoutDelivery && geoHref && (
                  <a
                    href={geoHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sora-600 dark:text-sora-400 font-semibold hover:underline"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      {isUz ? "Xaritada ko'rish" : "Открыть на карте"}
                    </span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700 flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{paymentLabel}</span>
                </div>

                {order.comment && (
                  <div className="pt-1 flex items-start gap-2 text-slate-600 dark:text-slate-300">
                    <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                    <span className="wrap-break-word">{order.comment}</span>
                  </div>
                )}
              </div>

              {order.customer && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 space-y-2.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {order.customer.type === "B2B" ? (
                      <Building2 className="w-4 h-4 text-amber-600" />
                    ) : (
                      <User className="w-4 h-4 text-sora-600" />
                    )}
                    <span>
                      {order.customer.type === "B2B"
                        ? isUz
                          ? "Yuridik shaxs (B2B)"
                          : "Юридическое лицо (B2B)"
                        : isUz
                        ? "Mijoz ma'lumotlari"
                        : "Данные клиента"}
                    </span>
                  </div>

                  {order.customer.client_name && (
                    <div className="font-semibold text-slate-800 dark:text-slate-100">
                      {order.customer.client_name}
                    </div>
                  )}

                  {order.customer.contact && (
                    <div className="space-y-1 text-slate-600 dark:text-slate-300">
                      {order.customer.contact.name && (
                        <div>{order.customer.contact.name}</div>
                      )}
                      {order.customer.contact.phone_1 && (
                        <div className="flex items-center gap-1.5 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{order.customer.contact.phone_1}</span>
                        </div>
                      )}
                      {order.customer.contact.phone_2 && (
                        <div className="flex items-center gap-1.5 font-mono text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{order.customer.contact.phone_2}</span>
                        </div>
                      )}
                      {order.customer.contact.tg_username && (
                        <div className="text-sora-600 dark:text-sora-400 font-medium">
                          Telegram: {order.customer.contact.tg_username}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Products Table */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Package className="w-4 h-4" />
                  <span>
                    {isUz
                      ? "Buyurtma tarkibi (1C aktual ma'lumotlari)"
                      : "Состав заказа (актуальные данные 1С)"}
                  </span>
                </h3>
                <span className="text-xs text-slate-500">
                  {order.products.length} {isUz ? "pozitsiya" : "поз."}
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">#</th>
                      <th className="py-2.5 px-3 font-semibold">
                        {isUz ? "Mahsulot" : "Товар"}
                      </th>
                      <th className="py-2.5 px-3 font-semibold text-right">
                        {isUz ? "Miqdor" : "Кол-во"}
                      </th>
                      <th className="py-2.5 px-3 font-semibold text-right">
                        {isUz ? "Narx" : "Цена"}
                      </th>
                      <th className="py-2.5 px-3 font-semibold text-right">
                        {isUz ? "Summa" : "Сумма"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {order.products.map((item) => (
                      <tr
                        key={`${item.line_number}-${item.product_id}`}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                      >
                        <td className="py-2.5 px-3 text-slate-400 font-mono">
                          {item.line_number}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                          {item.product_name}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap text-slate-700 dark:text-slate-300">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap text-slate-600 dark:text-slate-400">
                          {item.price.toLocaleString("ru-RU")}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold text-slate-900 dark:text-white">
                          {item.amount.toLocaleString("ru-RU")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-2 px-1 text-sm font-black">
                <span className="text-slate-700 dark:text-slate-200">
                  {isUz ? "Jami buyurtma summasi:" : "Итоговая сумма заказа:"}
                </span>
                <span className="text-sora-600 dark:text-sora-400 text-base">
                  {order.total_amount.toLocaleString("ru-RU")}{" "}
                  {isUz ? "so'm" : "сум"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
