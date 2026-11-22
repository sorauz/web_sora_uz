"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useAuthStore } from "@/lib/store/auth";
import { SORA_COMPANY_INFO } from "@/lib/config/company";
import type { SanitizedPublicKp } from "@/lib/kp/public-service";
import type { KpDocumentData } from "@/lib/kp/types";
import type { CatalogProductMap } from "@/lib/types/catalog-summary";
import {
  formatOrderDate,
  getOrderStatusUiMeta,
} from "@/lib/utils/order-status";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { KpConvertModal } from "@/components/kp/KpConvertModal";
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Loader2,
  Package,
  RefreshCw,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";

type PublicKpViewModel = Omit<SanitizedPublicKp, "client_id">;

interface KpPublicViewProps {
  locale: "uz" | "ru";
  token: string;
  initialKp: PublicKpViewModel | null;
  initialError?: string;
  expectedClientId?: string;
  productsMap: CatalogProductMap;
}

export function KpPublicView({
  locale,
  token,
  initialKp,
  initialError = "",
  expectedClientId,
  productsMap,
}: KpPublicViewProps) {
  const isUz = locale === "uz";
  const { user } = useAuthStore();

  const [kp, setKp] = useState<PublicKpViewModel | null>(initialKp);
  const [error, setError] = useState(initialError);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState<"" | "pdf" | "excel">("");
  const [downloadError, setDownloadError] = useState("");
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertedMessage, setConvertedMessage] = useState("");

  const refreshLiveStatus = async () => {
    setRefreshing(true);
    setError("");
    try {
      const res = await fetch(
        `/api/kp/public?token=${encodeURIComponent(token)}`,
        { cache: "no-store" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success || !data.kp) {
        setError(
          data.error ||
            (isUz
              ? "Tijorat taklifi holatini yangilab bo‘lmadi"
              : "Не удалось обновить статус КП")
        );
        return;
      }
      setKp(data.kp as PublicKpViewModel);
    } catch {
      setError(isUz ? "Tarmoq xatosi" : "Сетевая ошибка");
    } finally {
      setRefreshing(false);
    }
  };

  if (!kp) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-800 p-8 text-center space-y-4">
          <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h1 className="text-xl font-black text-slate-900 dark:text-white">
            {isUz ? "Hujjat topilmadi" : "Документ не найден"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {error ||
              (isUz
                ? "Ushbu QR-kod havolasi noto‘g‘ri yoki hujjat o‘chirilgan."
                : "Ссылка QR-кода недействительна или документ удалён.")}
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sora-600 text-white text-xs font-bold"
          >
            {isUz ? "Katalogga o‘tish" : "Перейти в каталог"}
          </Link>
        </div>
      </div>
    );
  }

  const statusMeta = getOrderStatusUiMeta(
    {
      statusCode: kp.status_code,
      statusText: kp.status,
      withoutDelivery: kp.without_delivery,
      isKp: kp.is_kp,
    },
    locale
  );

  const isKpActive = kp.is_kp && statusMeta.code === "KP_ACTIVE";
  const isKpExpired = kp.is_kp && statusMeta.code === "KP_EXPIRED";
  const isCancelled = statusMeta.code === "CANCELLED";
  const isConverted = !kp.is_kp && !isCancelled;

  const hasMatchingB2BSession =
    Boolean(user?.type === "B2B" && user?.id) &&
    (!expectedClientId || user?.id === expectedClientId);

  const buildDocData = (): KpDocumentData => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : SORA_COMPANY_INFO.website;
    return {
      orderNumber: kp.order_number,
      createdAtIso: kp.order_date,
      validUntilIso: kp.kp_valid_until,
      docLocale: locale,
      vatMode: "included",
      publicUrl: `${origin}/${locale}/kp/${token}`,
      totalAmountOverride: kp.total_amount,
      customer: {
        companyName:
          kp.customer.client_name ||
          (isUz ? "Tashkilot" : "Организация"),
        companyInn: kp.customer.client_inn,
        bankAccount: kp.requisites.bankAccount,
        bankMfo: kp.requisites.bankMfo,
        legalAddress: kp.requisites.legalAddress,
      },
      items: kp.products.map((prod) => {
        const cat = productsMap[prod.product_id];
        return {
          id: prod.product_id,
          sku: cat?.sku || "",
          name: isUz
            ? cat?.name_uz || prod.product_name
            : cat?.name_ru || prod.product_name,
          slug: isUz
            ? cat?.slug_uz || cat?.slug_ru
            : cat?.slug_ru || cat?.slug_uz,
          picture: cat?.picture || "",
          unit: isUz
            ? cat?.unit_uz || prod.unit || "dona"
            : cat?.unit_ru || prod.unit || "шт",
          quantity: prod.quantity,
          price: prod.price,
        };
      }),
    };
  };

  const handleDownload = async (format: "pdf" | "excel") => {
    if (downloading === format) return;
    setDownloading(format);
    setDownloadError("");
    try {
      const docData = buildDocData();
      if (format === "pdf") {
        const { generateAndDownloadKpPdf } = await import(
          "@/lib/kp/generate-pdf"
        );
        await generateAndDownloadKpPdf(docData);
      } else {
        const { generateAndDownloadKpExcel } = await import(
          "@/lib/kp/generate-excel"
        );
        await generateAndDownloadKpExcel(docData);
      }
    } catch {
      setDownloadError(
        isUz
          ? "Faylni yuklab olishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring."
          : "Ошибка при формировании файла. Пожалуйста, попробуйте снова."
      );
    } finally {
      setDownloading((curr) => (curr === format ? "" : curr));
    }
  };

  const tgText = isUz
    ? `Assalomu alaykum! #${kp.order_number} raqamli tijorat taklifi (KP) bo'yicha murojaat qilayotgan edim.`
    : `Здравствуйте! Обращаюсь по поводу коммерческого предложения №${kp.order_number}.`;

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 space-y-6">
      {/* Electronic Passport Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sora-50 dark:bg-sora-950/60 text-sora-700 dark:text-sora-300 text-[11px] font-bold border border-sora-200/70 dark:border-sora-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {isUz
                  ? "1C ERP Elektron Hujjat Pasporti"
                  : "Электронный паспорт документа 1С"}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {kp.is_kp
                ? isUz
                  ? `Tijorat taklifi #${kp.order_number}`
                  : `Коммерческое предложение №${kp.order_number}`
                : isUz
                  ? `Buyurtma #${kp.order_number}`
                  : `Заказ №${kp.order_number}`}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              {kp.order_date && (
                <span>
                  {isUz ? "Sana:" : "Дата:"}{" "}
                  {formatOrderDate(kp.order_date, locale)}
                </span>
              )}
              {kp.kp_valid_until && (
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {isUz ? "Amal qiladi:" : "Действует до:"}{" "}
                  {formatOrderDate(kp.kp_valid_until, locale)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${statusMeta.badgeClassName}`}
            >
              {statusMeta.label}
            </span>
            <button
              type="button"
              onClick={() => void refreshLiveStatus()}
              disabled={refreshing}
              title={isUz ? "1C holatini yangilash" : "Обновить статус"}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Live Status Banner */}
        {isKpActive && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
            <BadgeCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">
                {isUz
                  ? "Ushbu tijorat taklifi FAOL (kuchda)"
                  : "Данное коммерческое предложение АКТИВНО"}
              </div>
              <p className="text-xs opacity-90 mt-0.5">
                {isUz
                  ? "Mahsulot narxlari 1C ERP bazasida amal qilish muddati tugagunga qadar kafolatlangan (o‘zgarmas)."
                  : "Цены на товары зафиксированы в базе 1С ERP до окончания срока действия документа."}
              </p>
            </div>
          </div>
        )}

        {isKpExpired && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-xs sm:text-sm text-amber-900 dark:text-amber-200">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">
                {isUz
                  ? "Tijorat taklifining amal qilish muddati tugagan"
                  : "Срок действия коммерческого предложения истёк"}
              </div>
              <p className="text-xs opacity-90 mt-0.5">
                {isUz
                  ? "Muddatni uzaytirish uchun menejer bilan bog‘laning yoki savatchadan yangi KP yarating."
                  : "Для продления срока свяжитесь с менеджером или оформите новое КП."}
              </p>
            </div>
          </div>
        )}

        {isCancelled && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-start gap-3 text-xs sm:text-sm text-rose-900 dark:text-rose-200">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">
                {isUz
                  ? "Ushbu tijorat taklifi bekor qilingan (noaktiv)"
                  : "Данное коммерческое предложение отменено"}
              </div>
            </div>
          </div>
        )}

        {isConverted && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 flex items-start gap-3 text-xs sm:text-sm text-sky-900 dark:text-sky-200">
              <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">
                  {convertedMessage ||
                    (isUz
                      ? "Ushbu tijorat taklifi haqiqiy buyurtmaga aylantirilgan!"
                      : "Данное коммерческое предложение переведено в заказ!")}
                </div>
              </div>
            </div>

            {kp.timeline.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <OrderTimeline
                  timeline={kp.timeline}
                  statusCode={kp.status_code}
                  withoutDelivery={kp.without_delivery}
                  locale={locale}
                />
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-4 py-3 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Sanitized Organization Box (NO personal phones / tg_username) */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 space-y-1.5 text-xs sm:text-sm">
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>
              {isUz ? "Buyurtmachi tashkilot" : "Организация-покупатель"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-slate-700 dark:text-slate-200">
            {kp.customer.client_name && (
              <span className="font-semibold">{kp.customer.client_name}</span>
            )}
            {kp.customer.client_inn && (
              <span className="font-mono text-xs bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                {isUz ? "STIR:" : "ИНН:"} {kp.customer.client_inn}
              </span>
            )}
          </div>
          {(kp.requisites.bankAccount ||
            kp.requisites.bankMfo ||
            kp.requisites.legalAddress) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              {kp.requisites.bankAccount && (
                <span className="font-mono">
                  {isUz ? "H/R:" : "Р/с:"} {kp.requisites.bankAccount}
                </span>
              )}
              {kp.requisites.bankMfo && (
                <span className="font-mono">MFO: {kp.requisites.bankMfo}</span>
              )}
              {kp.requisites.legalAddress && (
                <span>{kp.requisites.legalAddress}</span>
              )}
            </div>
          )}
        </div>

        {/* Locked-in Products Table with Price Comparison */}
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
                  {isUz ? "KP narxi" : "Цена КП"}
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  {isUz ? "Summa" : "Сумма"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {kp.products.map((item) => {
                const cat = productsMap[item.product_id];
                const prodName = isUz
                  ? cat?.name_uz || item.product_name
                  : cat?.name_ru || item.product_name;
                const prodSlug = isUz
                  ? cat?.slug_uz || cat?.slug_ru
                  : cat?.slug_ru || cat?.slug_uz;
                const livePriceIncreased =
                  cat?.price && cat.price > item.price && item.price > 0;

                return (
                  <tr key={`${item.line_number}-${item.product_id}`}>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">
                      {item.line_number}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        {cat?.picture ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-700 shrink-0">
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
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          {prodSlug ? (
                            <Link
                              href={`/products/${prodSlug}`}
                              target="_blank"
                              className="font-semibold text-slate-900 dark:text-white hover:text-sora-600 inline-flex items-center gap-1"
                            >
                              <span>{prodName}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </Link>
                          ) : (
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {prodName}
                            </span>
                          )}
                          {livePriceIncreased && (
                            <div className="mt-0.5 inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md">
                              <span>
                                {isUz
                                  ? `Saytda hozir: ${cat.price?.toLocaleString("ru-RU")} → Sizga: ${item.price.toLocaleString("ru-RU")}`
                                  : `Сейчас на сайте: ${cat.price?.toLocaleString("ru-RU")} → По КП: ${item.price.toLocaleString("ru-RU")}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap font-medium">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap text-slate-600 dark:text-slate-300">
                      {item.price.toLocaleString("ru-RU")}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold text-slate-900 dark:text-white">
                      {item.amount.toLocaleString("ru-RU")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-1 text-base font-black">
          <span className="text-slate-700 dark:text-slate-200">
            {isUz ? "Jami summa (QQS bilan):" : "Итого с НДС:"}
          </span>
          <span className="text-xl text-sora-600 dark:text-sora-400">
            {kp.total_amount.toLocaleString("ru-RU")}{" "}
            {isUz ? "so'm" : "сум"}
          </span>
        </div>

        {downloadError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-4 py-3 text-xs text-rose-700 dark:text-rose-300"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{downloadError}</span>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {isKpActive && (
              <button
                type="button"
                onClick={() => setConvertOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sora-600 hover:bg-sora-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-sora-500/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isUz
                    ? "Xaridni tasdiqlash (Buyurtma berish)"
                    : "Подтвердить и оформить заказ"}
                </span>
              </button>
            )}

            <button
              type="button"
              disabled={downloading === "pdf"}
              onClick={() => void handleDownload("pdf")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              {downloading === "pdf" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span>PDF</span>
            </button>

            <button
              type="button"
              disabled={downloading === "excel"}
              onClick={() => void handleDownload("excel")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              {downloading === "excel" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5" />
              )}
              <span>Excel (.xlsx)</span>
            </button>
          </div>

          <a
            href={`https://t.me/sora_uz?text=${encodeURIComponent(tgText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-bold"
          >
            <Send className="w-3.5 h-3.5 text-[#229ED9]" />
            <span>
              {isKpExpired
                ? isUz
                  ? "Muddatni uzaytirish"
                  : "Продлить срок"
                : isUz
                  ? "Menejerga yozish"
                  : "Написать менеджеру"}
            </span>
          </a>
        </div>
      </div>

      <KpConvertModal
        isOpen={convertOpen}
        onClose={() => setConvertOpen(false)}
        orderId={kp.order_id}
        orderNumber={kp.order_number}
        locale={locale}
        publicToken={token}
        requiresPhoneOtp={!hasMatchingB2BSession}
        defaultWithoutDelivery={kp.without_delivery}
        onConverted={(res) => {
          setConvertedMessage(
            res.message ||
              (isUz
                ? "Tijorat taklifi muvaffaqiyatli buyurtmaga aylantirildi!"
                : "КП успешно переведено в заказ!")
          );
          void refreshLiveStatus();
        }}
      />
    </div>
  );
}
