"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { CatalogProductMap } from "@/lib/types/catalog-summary";
import {
  FileText,
  Package,
  Truck,
  Store,
  ShoppingBag,
  LogIn,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
  Copy,
  Check,
  X,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface OrdersHistoryClientProps {
  locale: "uz" | "ru";
  productsMap?: CatalogProductMap;
}

const PAGE_LIMIT = 20;

type DocMode = "orders" | "kp";
type FilterTab =
  | "all"
  | "active"
  | "delivered"
  | "cancelled"
  | "kp_active"
  | "kp_expired";

const ACTIVE_STATUS_CODES = [
  "PENDING",
  "CONFIRMED",
  "ASSEMBLED",
  "SHIPPED",
  "READY_FOR_PICKUP",
];

export function OrdersHistoryClient({
  locale,
  productsMap = {},
}: OrdersHistoryClientProps) {
  const t = useTranslations("orders");
  const common = useTranslations("common");
  const isUz = locale === "uz";
  const searchParams = useSearchParams();

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

  // Doc section (Regular Orders vs Commercial Offers KP) & Filter & Search states
  const [docMode, setDocMode] = useState<DocMode>("orders");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedOrderNumber, setCopiedOrderNumber] = useState<string | null>(
    null
  );

  // Order detail modal state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] =
    useState<OneCOrderDetailResponse | null>(null);
  const [detailKpToken, setDetailKpToken] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const activeFilter = user?.type === "B2B" ? b2bOnlyOnline : true;
  const currentKey = user
    ? `${user.type}:${user.id}:${docMode}:${String(activeFilter)}:${refreshTick}`
    : "";
  const isInitialLoading = Boolean(currentKey && loadedKey !== currentKey);

  // Initial & Filtered Fetching
  useEffect(() => {
    if (!currentKey || !user) return;
    let active = true;

    const qs = new URLSearchParams({
      limit: String(PAGE_LIMIT),
      offset: "0",
      only_online: activeFilter ? "true" : "false",
      is_kp: docMode === "kp" ? "true" : "false",
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
  }, [currentKey, user, activeFilter, docMode, isUz, t]);

  const handleOpenDetail = async (orderId: string) => {
    setSelectedOrderId(orderId);
    setDetailOrder(null);
    setDetailKpToken(null);
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
        setDetailKpToken(
          typeof data.kp_public_token === "string" ? data.kp_public_token : null
        );
      }
    } catch {
      setDetailError(
        isUz ? "Tarmoq xatosi yuz berdi" : "Произошла сетевая ошибка"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // Deep linking: Auto-open modal if ?orderId=... is in URL
  const deepOrderId =
    searchParams?.get("orderId") || searchParams?.get("order_id");
  const handledDeepOrderRef = useRef<string | null>(null);

  useEffect(() => {
    if (!deepOrderId || !user) return;
    if (handledDeepOrderRef.current === deepOrderId) return;
    handledDeepOrderRef.current = deepOrderId;

    const timer = setTimeout(() => {
      handleOpenDetail(deepOrderId);
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepOrderId, user]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || !user) return;
    setLoadingMore(true);

    try {
      const qs = new URLSearchParams({
        limit: String(PAGE_LIMIT),
        offset: String(offset),
        only_online: activeFilter ? "true" : "false",
        is_kp: docMode === "kp" ? "true" : "false",
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
      // Keep loaded
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCopy = (orderNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`#${orderNumber}`);
    setCopiedOrderNumber(orderNumber);
    setTimeout(() => {
      setCopiedOrderNumber((curr) => (curr === orderNumber ? null : curr));
    }, 2000);
  };

  // Tab counts
  const countAll = orders.length;
  const countActive = useMemo(
    () =>
      orders.filter((i) =>
        Boolean(i.status_code && ACTIVE_STATUS_CODES.includes(i.status_code))
      ).length,
    [orders]
  );
  const countDelivered = useMemo(
    () => orders.filter((i) => i.status_code === "DELIVERED").length,
    [orders]
  );
  const countCancelled = useMemo(
    () => orders.filter((i) => i.status_code === "CANCELLED").length,
    [orders]
  );
  const countKpActive = useMemo(
    () =>
      orders.filter(
        (i) =>
          i.status_code === "KP_ACTIVE" ||
          (i.is_kp && i.status_code === "PENDING")
      ).length,
    [orders]
  );
  const countKpExpired = useMemo(
    () => orders.filter((i) => i.status_code === "KP_EXPIRED").length,
    [orders]
  );

  // Filtered orders by Tab & Search query
  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase().replace(/^#/, "");

    return orders.filter((item) => {
      // 1. Search filter
      if (q && !item.order_number.toLowerCase().includes(q)) {
        return false;
      }

      // 2. Tab filter
      if (activeTab === "active") {
        return Boolean(
          item.status_code && ACTIVE_STATUS_CODES.includes(item.status_code)
        );
      }
      if (activeTab === "delivered") {
        return item.status_code === "DELIVERED";
      }
      if (activeTab === "cancelled") {
        return item.status_code === "CANCELLED";
      }
      if (activeTab === "kp_active") {
        return (
          item.status_code === "KP_ACTIVE" ||
          (item.is_kp && item.status_code === "PENDING")
        );
      }
      if (activeTab === "kp_expired") {
        return item.status_code === "KP_EXPIRED";
      }
      return true;
    });
  }, [orders, activeTab, searchQuery]);

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
      {/* Header & Controls Row */}
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
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${isInitialLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Primary Section Switcher: Regular Orders vs Commercial Offers (KP) */}
      <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 gap-1">
        <button
          type="button"
          onClick={() => {
            setDocMode("orders");
            setActiveTab("all");
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            docMode === "orders"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Package className="w-4 h-4 text-sora-600" />
          <span>{t("sectionOrders")}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setDocMode("kp");
            setActiveTab("all");
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            docMode === "kp"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4 text-violet-600" />
          <span>{t("sectionKp")}</span>
        </button>
      </div>

      {/* Mini-Stats Bar */}
      {!isInitialLoading && orders.length > 0 && docMode === "orders" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-sora-50 dark:bg-sora-950/60 text-sora-600 dark:text-sora-400 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 dark:text-white">
                {countAll}
              </div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {t("tabAll")}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-amber-600 dark:text-amber-400">
                {countActive}
              </div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {t("tabActive")}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                {countDelivered}
              </div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {t("tabDelivered")}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
              <X className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-slate-700 dark:text-slate-300">
                {countCancelled}
              </div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {t("tabCancelled")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs & Search Filter */}
      {!isInitialLoading && orders.length > 0 && (
        <div className="space-y-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "all"
                  ? "bg-sora-600 text-white shadow-sm shadow-sora-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span>{t("tabAll")}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                  activeTab === "all"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                {countAll}
              </span>
            </button>

            {docMode === "kp" ? (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("kp_active")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === "kp_active"
                      ? "bg-violet-600 text-white shadow-sm shadow-violet-500/20"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{t("tabKpActive")}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                      activeTab === "kp_active"
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {countKpActive}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("kp_expired")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === "kp_expired"
                      ? "bg-amber-600 text-white shadow-sm shadow-amber-500/20"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{t("tabKpExpired")}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                      activeTab === "kp_expired"
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {countKpExpired}
                  </span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab("active")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === "active"
                      ? "bg-amber-600 text-white shadow-sm shadow-amber-500/20"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{t("tabActive")}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                      activeTab === "active"
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {countActive}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("delivered")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === "delivered"
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{t("tabDelivered")}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                      activeTab === "delivered"
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {countDelivered}
                  </span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("cancelled")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "cancelled"
                  ? "bg-slate-700 text-white shadow-sm shadow-slate-700/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span>{t("tabCancelled")}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                  activeTab === "cancelled"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                {countCancelled}
              </span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sora-500/30 focus:border-sora-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

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

      {/* Empty State (No orders at all) */}
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

      {/* Search / Tab Empty State */}
      {!isInitialLoading &&
        orders.length > 0 &&
        filteredOrders.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {t("noSearchMatch")}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                {common("reset")}
              </button>
            )}
          </div>
        )}

      {/* Orders List */}
      {!isInitialLoading && filteredOrders.length > 0 && (
        <div className="space-y-3">
          {filteredOrders.map((item) => {
            const isKpDoc = Boolean(item.is_kp || docMode === "kp");
            const statusMeta = getOrderStatusUiMeta(
              {
                statusCode: item.status_code,
                statusText: item.status,
                withoutDelivery: item.without_delivery,
                isKp: isKpDoc,
              },
              locale
            );

            const isActiveOrder =
              !isKpDoc &&
              Boolean(
                item.status_code && ACTIVE_STATUS_CODES.includes(item.status_code)
              );
            const isPendingOrder = !isKpDoc && item.status_code === "PENDING";

            // 4-step progress computation
            // Step 1: CONFIRMED (25%)
            // Step 2: ASSEMBLED (50%)
            // Step 3: SHIPPED / READY_FOR_PICKUP (75%)
            // Step 4: DELIVERED (100%)
            let activeStep = 0;
            if (item.status_code === "CONFIRMED") activeStep = 1;
            else if (item.status_code === "ASSEMBLED") activeStep = 2;
            else if (
              item.status_code === "SHIPPED" ||
              item.status_code === "READY_FOR_PICKUP"
            )
              activeStep = 3;
            else if (item.status_code === "DELIVERED") activeStep = 4;

            const isCopied = copiedOrderNumber === item.order_number;

            return (
              <button
                key={item.order_id}
                type="button"
                onClick={() => handleOpenDetail(item.order_id)}
                className="w-full text-left bg-white dark:bg-slate-900 hover:border-sora-400 dark:hover:border-sora-600 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 transition-all shadow-2xs hover:shadow-md cursor-pointer group space-y-3"
              >
                {/* Top Row: Order Number, Copy Button, Status Badge, Offline Tag */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {isKpDoc ? "KP " : ""}#{item.order_number}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleCopy(item.order_number, e)}
                      title={t("copyOrderNumber")}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

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

                  <div className="text-right sm:text-right">
                    <div className="text-base font-black text-sora-600 dark:text-sora-400">
                      {item.total_amount.toLocaleString("ru-RU")}{" "}
                      {common("currency")}
                    </div>
                  </div>
                </div>

                {/* Middle Row: Mini-Progress Bar for Active Orders */}
                {isActiveOrder && !isPendingOrder && (
                  <div className="pt-1 pb-1 space-y-1.5">
                    <div className="grid grid-cols-4 gap-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-colors ${
                          activeStep >= 1
                            ? "bg-emerald-500 dark:bg-emerald-400"
                            : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      />
                      <div
                        className={`h-1.5 rounded-full transition-colors ${
                          activeStep >= 2
                            ? "bg-emerald-500 dark:bg-emerald-400"
                            : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      />
                      <div
                        className={`h-1.5 rounded-full transition-colors ${
                          activeStep >= 3
                            ? "bg-emerald-500 dark:bg-emerald-400"
                            : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      />
                      <div
                        className={`h-1.5 rounded-full transition-colors ${
                          activeStep >= 4
                            ? "bg-emerald-500 dark:bg-emerald-400"
                            : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                      <span className={activeStep >= 1 ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>
                        {isUz ? "Tasdiqlandi" : "Подтверждён"}
                      </span>
                      <span className={activeStep >= 2 ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>
                        {isUz ? "Yig'ildi" : "Собран"}
                      </span>
                      <span className={activeStep >= 3 ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>
                        {item.without_delivery
                          ? isUz
                            ? "Tayyor"
                            : "Готов"
                          : isUz
                          ? "Yo'lda"
                          : "В пути"}
                      </span>
                      <span className={activeStep >= 4 ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>
                        {isUz ? "Yetkazildi" : "Доставлен"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Pending State Indicator */}
                {isPendingOrder && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>{t("pendingBanner")}</span>
                  </div>
                )}

                {/* Bottom Row: Metadata & View Details arrow */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    {item.order_date && (
                      <span>{formatOrderDate(item.order_date, locale)}</span>
                    )}
                    {isKpDoc && item.kp_valid_until && (
                      <span className="font-semibold text-violet-600 dark:text-violet-400">
                        {isUz ? "Muddat:" : "Срок:"}{" "}
                        {formatOrderDate(item.kp_valid_until, locale)}
                      </span>
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

                  <span className="inline-flex items-center gap-1 font-bold text-slate-500 group-hover:text-sora-600 dark:group-hover:text-sora-400 transition-colors self-end sm:self-auto">
                    <span>{t("viewDetails")}</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
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

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={Boolean(selectedOrderId)}
        onClose={() => {
          setSelectedOrderId(null);
          setDetailOrder(null);
          setDetailKpToken(null);
          setDetailError("");
        }}
        order={detailOrder}
        kpPublicToken={detailKpToken}
        loading={detailLoading}
        error={detailError}
        locale={locale}
        productsMap={productsMap}
        onKpUpdated={(action, res) => {
          if (action === "CONVERT_TO_ORDER") {
            setDocMode("orders");
            setActiveTab("all");
          }
          setRefreshTick((n) => n + 1);
          void handleOpenDetail(res.order_id);
        }}
      />
    </div>
  );
}
