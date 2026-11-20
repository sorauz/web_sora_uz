"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/store/auth";
import {
  OneCOrderDetailResponse,
  OneCOrderHistoryItem,
} from "@/lib/schemas/order";
import {
  formatOrderDate,
  getOrderStatusUiMeta,
} from "@/lib/utils/order-status";
import { OrderDetailModal } from "@/components/orders/OrderDetailModal";
import {
  Package,
  Truck,
  Store,
  ShoppingBag,
  LogIn,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface OrdersHistoryClientProps {
  locale: "uz" | "ru";
}

const PAGE_LIMIT = 20;

export function OrdersHistoryClient({ locale }: OrdersHistoryClientProps) {
  const t = useTranslations("orders");
  const common = useTranslations("common");
  const isUz = locale === "uz";

  const { user, isInitialized, openModal } = useAuthStore();

  // For B2B, default to false (show both site + offline orders per 1C spec); B2C defaults to online only
  const [b2bOnlyOnline, setB2bOnlyOnline] = useState(false);
  const [orders, setOrders] = useState<OneCOrderHistoryItem[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [listError, setListError] = useState("");
  const [loadedKey, setLoadedKey] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  // Order detail modal state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] =
    useState<OneCOrderDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const activeFilter = user?.type === "B2B" ? b2bOnlyOnline : true;
  const currentKey = user
    ? `${user.type}:${user.id}:${String(activeFilter)}:${refreshTick}`
    : "";
  const isInitialLoading = Boolean(currentKey && loadedKey !== currentKey);

  useEffect(() => {
    if (!currentKey || !user) return;
    let active = true;

    const qs = new URLSearchParams({
      limit: String(PAGE_LIMIT),
      offset: "0",
      only_online: activeFilter ? "true" : "false",
    });

    fetch(`/api/orders?${qs.toString()}`)
      .then(async (res) => ({
        ok: res.ok,
        status: res.status,
        data: await res.json().catch(() => ({})),
      }))
      .then(({ ok, status, data }) => {
        if (!active) return;
        if (!ok) {
          setListError(
            status === 401
              ? t("loginRequiredTitle")
              : data.error ||
                  (isUz
                    ? "Buyurtmalar ro'yxatini yuklab bo'lmadi"
                    : "Не удалось загрузить список заказов")
          );
          setOrders([]);
          setHasMore(false);
          setOffset(0);
          return;
        }

        const fetched: OneCOrderHistoryItem[] = Array.isArray(data.orders)
          ? data.orders
          : [];
        setListError("");
        setOrders(fetched);
        setHasMore(Boolean(data.has_more));
        setOffset(fetched.length);
      })
      .catch(() => {
        if (!active) return;
        setListError(
          isUz ? "Tarmoq xatosi yuz berdi" : "Произошла сетевая ошибка"
        );
      })
      .finally(() => {
        if (active) setLoadedKey(currentKey);
      });

    return () => {
      active = false;
    };
  }, [currentKey, user, activeFilter, isUz, t]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || !user) return;
    setLoadingMore(true);

    try {
      const qs = new URLSearchParams({
        limit: String(PAGE_LIMIT),
        offset: String(offset),
        only_online: activeFilter ? "true" : "false",
      });

      const res = await fetch(`/api/orders?${qs.toString()}`);
      const data = await res.json().catch(() => ({}));

      if (res.ok && Array.isArray(data.orders)) {
        const nextItems: OneCOrderHistoryItem[] = data.orders;
        setOrders((prev) => [...prev, ...nextItems]);
        setHasMore(Boolean(data.has_more));
        setOffset((prev) => prev + nextItems.length);
      }
    } catch {
      // Keep already loaded orders
    } finally {
      setLoadingMore(false);
    }
  };

  const handleOpenDetail = async (orderId: string) => {
    setSelectedOrderId(orderId);
    setDetailOrder(null);
    setDetailError("");
    setDetailLoading(true);

    try {
      const res = await fetch(
        `/api/order/status?orderId=${encodeURIComponent(orderId)}`
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 403) {
          setDetailError(data.error || t("forbiddenError"));
        } else if (res.status === 404) {
          setDetailError(data.error || t("notFoundError"));
        } else {
          setDetailError(
            data.error ||
              (isUz
                ? "Buyurtma tafsilotini yuklab bo'lmadi"
                : "Не удалось загрузить детали заказа")
          );
        }
        return;
      }

      if (data.order) {
        setDetailOrder(data.order as OneCOrderDetailResponse);
      }
    } catch {
      setDetailError(
        isUz ? "Tarmoq xatosi yuz berdi" : "Произошла сетевая ошибка"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-4">
        <div className="h-8 w-56 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div className="h-28 bg-slate-100 dark:bg-slate-800/60 rounded-3xl animate-pulse" />
        <div className="h-28 bg-slate-100 dark:bg-slate-800/60 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-5 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-sora-50 dark:bg-sora-950/60 text-sora-600 dark:text-sora-400 flex items-center justify-center mx-auto">
            <LogIn className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t("loginRequiredTitle")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t("loginRequiredDesc")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => openModal({ tab: "login" })}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sora-600 hover:bg-sora-700 text-white text-sm font-bold shadow-md shadow-sora-500/20 transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{t("loginBtn")}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 space-y-6">
      {/* Header & B2B filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {user.type === "B2B" && (
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setB2bOnlyOnline(false)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  !b2bOnlyOnline
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {t("filterAll")}
              </button>
              <button
                type="button"
                onClick={() => setB2bOnlyOnline(true)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  b2bOnlyOnline
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {t("filterOnlineOnly")}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setRefreshTick((n) => n + 1)}
            title={isUz ? "Yangilash" : "Обновить"}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 ${isInitialLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Error State */}
      {!isInitialLoading && listError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs sm:text-sm text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{listError}</span>
          </div>
          <button
            type="button"
            onClick={() => setRefreshTick((n) => n + 1)}
            className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer shrink-0"
          >
            {isUz ? "Qayta urinish" : "Повторить"}
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isInitialLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 rounded-3xl bg-slate-100 dark:bg-slate-800/60 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isInitialLoading && !listError && orders.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t("emptyTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {t("emptyDesc")}
            </p>
          </div>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sora-600 hover:bg-sora-700 text-white text-xs font-bold transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t("goToCatalog")}</span>
          </Link>
        </div>
      )}

      {/* Orders List */}
      {!isInitialLoading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((item) => {
            const statusMeta = getOrderStatusUiMeta(
              {
                statusCode: item.status_code,
                statusText: item.status,
                withoutDelivery: item.without_delivery,
              },
              locale
            );

            return (
              <button
                key={item.order_id}
                type="button"
                onClick={() => handleOpenDetail(item.order_id)}
                className="w-full text-left bg-white dark:bg-slate-900 hover:border-sora-400 dark:hover:border-sora-600 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 transition-all shadow-2xs hover:shadow-md cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        #{item.order_number}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusMeta.badgeClassName}`}
                      >
                        {statusMeta.label}
                      </span>
                      {!item.online && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {t("offlineBadge")}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      {item.order_date && (
                        <span>{formatOrderDate(item.order_date, locale)}</span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        {item.without_delivery ? (
                          <Store className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Truck className="w-3.5 h-3.5 text-sora-600" />
                        )}
                        {item.without_delivery
                          ? t("deliveryPickup")
                          : t("deliveryCourier")}
                      </span>
                      <span>
                        {t("itemsCount", { count: item.items_count })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-right">
                      <div className="text-base font-black text-sora-600 dark:text-sora-400">
                        {item.total_amount.toLocaleString("ru-RU")}{" "}
                        {common("currency")}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 group-hover:text-sora-600 dark:group-hover:text-sora-400 transition-colors">
                      <span className="hidden sm:inline">{t("viewDetails")}</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}

          {hasMore && (
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{loadingMore ? t("loading") : t("loadMore")}</span>
              </button>
            </div>
          )}
        </div>
      )}

      <OrderDetailModal
        isOpen={Boolean(selectedOrderId)}
        onClose={() => {
          setSelectedOrderId(null);
          setDetailOrder(null);
          setDetailError("");
        }}
        order={detailOrder}
        loading={detailLoading}
        error={detailError}
        locale={locale}
      />
    </div>
  );
}
