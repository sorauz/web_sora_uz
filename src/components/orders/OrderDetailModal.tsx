"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/lib/store/cart";
import { OneCOrderDetailResponse } from "@/lib/schemas/order";
import {
  formatOrderDate,
  getOrderStatusUiMeta,
} from "@/lib/utils/order-status";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { CatalogProductMap } from "@/lib/types/catalog-summary";
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
  Copy,
  Check,
  RotateCcw,
  Printer,
  Send,
} from "lucide-react";

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OneCOrderDetailResponse | null;
  loading: boolean;
  error: string;
  locale: "uz" | "ru";
  productsMap?: CatalogProductMap;
}

export function OrderDetailModal({
  isOpen,
  onClose,
  order,
  loading,
  error,
  locale,
  productsMap = {},
}: OrderDetailModalProps) {
  const t = useTranslations("orders");
  const common = useTranslations("common");
  const router = useRouter();
  const isUz = locale === "uz";

  const [copied, setCopied] = useState(false);
  const { addItem } = useCartStore();

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
      ? t("paymentTransfer")
      : t("paymentCashOrCard");

  const handleCopyOrderNumber = () => {
    if (!order?.order_number) return;
    navigator.clipboard.writeText(`#${order.order_number}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRepeatOrder = () => {
    if (!order?.products || order.products.length === 0) return;

    for (const prod of order.products) {
      const cat = productsMap[prod.product_id];
      addItem(
        {
          id: prod.product_id,
          sku: cat?.sku || "",
          name: isUz
            ? cat?.name_uz || prod.product_name
            : cat?.name_ru || prod.product_name,
          name_uz: cat?.name_uz || prod.product_name,
          name_ru: cat?.name_ru || prod.product_name,
          slug: isUz
            ? cat?.slug_uz || cat?.slug_ru
            : cat?.slug_ru || cat?.slug_uz,
          slug_uz: cat?.slug_uz,
          slug_ru: cat?.slug_ru,
          price:
            prod.price > 0
              ? prod.price
              : cat?.price && cat.price > 0
              ? cat.price
              : 0,
          picture: cat?.picture || "",
          unit: isUz
            ? cat?.unit_uz || prod.unit || "dona"
            : cat?.unit_ru || prod.unit || "шт",
          unit_uz: cat?.unit_uz || prod.unit || "dona",
          unit_ru: cat?.unit_ru || prod.unit || "шт",
        },
        prod.quantity || 1
      );
    }

    onClose();
    router.push("/cart");
  };

  const handlePrint = () => {
    window.print();
  };

  const tgMessage = order
    ? isUz
      ? `Assalomu alaykum! #${order.order_number} raqamli buyurtma bo'yicha savolim bor edi.`
      : `Здравствуйте! У меня вопрос по заказу #${order.order_number}.`
    : "";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 print:bg-white print:p-0"
      onClick={onClose}
    >
      <div
        id="order-detail-dialog"
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 space-y-6 print:max-h-none print:shadow-none print:border-none print:p-6 print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Row */}
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

              {order?.order_number && (
                <button
                  type="button"
                  onClick={handleCopyOrderNumber}
                  title={t("copyOrderNumber")}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-[11px] font-semibold transition-colors no-print cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">{t("copied")}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>{t("copyOrderNumber")}</span>
                    </>
                  )}
                </button>
              )}

              {statusMeta && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusMeta.badgeClassName}`}
                >
                  {statusMeta.label}
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
            aria-label={common("reset")}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 no-print"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-sora-600" />
            <p className="text-xs sm:text-sm font-semibold">{t("loading")}</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">
                {isUz ? "Xatolik yuz berdi" : "Ошибка"}
              </div>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Order Details Body */}
        {!loading && !error && order && (
          <div className="space-y-6">
            {/* Status explanation */}
            {order.status && (
              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm font-semibold border ${
                  statusMeta?.badgeClassName ||
                  "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                {order.status}
              </div>
            )}

            {/* Timeline */}
            {order.timeline && order.timeline.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <OrderTimeline
                  timeline={order.timeline}
                  statusCode={order.status_code}
                  withoutDelivery={withoutDelivery}
                  locale={locale}
                />
              </div>
            )}

            {/* Delivery & Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 space-y-2.5">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {withoutDelivery ? (
                    <Store className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Truck className="w-4 h-4 text-sora-600" />
                  )}
                  <span>
                    {withoutDelivery
                      ? t("deliveryPickup")
                      : t("deliveryCourier")}
                  </span>
                </div>

                {order.delivery?.pickup_point && (
                  <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                    <span>{order.delivery.pickup_point}</span>
                  </div>
                )}

                {geoHref && (
                  <a
                    href={geoHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sora-600 hover:text-sora-700 dark:text-sora-400 no-print"
                  >
                    <span>
                      {isUz ? "Xaritada ko'rish" : "Посмотреть на карте"}
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
                    <span className="break-words">{order.comment}</span>
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

            {/* Products Table (Enriched with Catalog thumbnails, SKU and Links) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Package className="w-4 h-4" />
                  <span>{t("productsTitle")}</span>
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
                      <th className="py-2.5 px-3 font-semibold">{t("colProduct")}</th>
                      <th className="py-2.5 px-3 font-semibold text-right">
                        {t("colQty")}
                      </th>
                      <th className="py-2.5 px-3 font-semibold text-right">
                        {t("colPrice")}
                      </th>
                      <th className="py-2.5 px-3 font-semibold text-right">
                        {t("colAmount")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {order.products.map((item) => {
                      const cat = productsMap[item.product_id];
                      const prodSlug = isUz
                        ? cat?.slug_uz || cat?.slug_ru
                        : cat?.slug_ru || cat?.slug_uz;
                      const prodName = isUz
                        ? cat?.name_uz || item.product_name
                        : cat?.name_ru || item.product_name;

                      return (
                        <tr
                          key={`${item.line_number}-${item.product_id}`}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] align-middle">
                            {item.line_number}
                          </td>
                          <td className="py-2.5 px-3 align-middle">
                            <div className="flex items-center gap-2.5">
                              {cat?.picture ? (
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 relative">
                                  <Image
                                    src={cat.picture}
                                    alt={prodName}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                    unoptimized
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-slate-400">
                                  <Package className="w-4 h-4" />
                                </div>
                              )}
                              <div className="min-w-0">
                                {prodSlug ? (
                                  <Link
                                    href={`/products/${prodSlug}`}
                                    target="_blank"
                                    className="font-semibold text-slate-900 dark:text-white hover:text-sora-600 dark:hover:text-sora-400 transition-colors inline-flex items-center gap-1 group line-clamp-2"
                                  >
                                    <span>{prodName}</span>
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 no-print" />
                                  </Link>
                                ) : (
                                  <div className="font-semibold text-slate-900 dark:text-white line-clamp-2">
                                    {prodName}
                                  </div>
                                )}
                                {cat?.sku && (
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    {t("skuLabel")}: {cat.sku}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium align-middle">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap text-slate-600 dark:text-slate-400 align-middle">
                            {item.price.toLocaleString("ru-RU")}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold text-slate-900 dark:text-white align-middle">
                            {item.amount.toLocaleString("ru-RU")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-2 px-1 text-sm font-black">
                <span className="text-slate-700 dark:text-slate-200">
                  {t("totalAmountLabel")}
                </span>
                <span className="text-sora-600 dark:text-sora-400 text-base">
                  {order.total_amount.toLocaleString("ru-RU")}{" "}
                  {common("currency")}
                </span>
              </div>
            </div>

            {/* Modal Bottom Actions (Repeat Order, Print, Telegram Support) */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 no-print">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleRepeatOrder}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sora-600 hover:bg-sora-700 text-white font-bold text-xs shadow-md shadow-sora-500/20 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t("repeatOrder")}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t("printOrder")}</span>
                </button>
              </div>

              <a
                href={`https://t.me/sora_uz?text=${encodeURIComponent(tgMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-semibold text-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#229ED9]" />
                <span>{t("contactSupport")}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
