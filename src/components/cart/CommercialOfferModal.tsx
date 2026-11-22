"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "@/i18n/routing";
import { useCartStore } from "@/lib/store/cart";
import { useAuthStore } from "@/lib/store/auth";
import { CheckoutOtpModal } from "@/components/checkout/CheckoutOtpModal";
import { SORA_COMPANY_INFO } from "@/lib/config/company";
import type { KpVatMode } from "@/lib/kp/calculations";
import type { KpDocumentData } from "@/lib/kp/types";
import { reachGoal } from "@/lib/analytics/yandex";
import {
  formatInnInput,
  formatUzPhoneInput,
  isValidUzPhone,
  normalizeUzPhone,
} from "@/lib/utils/phone";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronDown,
  Copy,
  Check,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";

interface CommercialOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: "uz" | "ru";
}

interface CreatedKpSuccess {
  orderNumber: string;
  kpValidUntil: string;
  publicToken: string;
  publicPath: string;
  publicUrl: string;
  docData: KpDocumentData;
  format: "pdf" | "excel";
}

function readInitialKpProfile(
  user: ReturnType<typeof useAuthStore.getState>["user"]
): {
  companyInn: string;
  companyName: string;
  fullName: string;
  phone: string;
} {
  let companyInn =
    user?.type === "B2B" && user.inn ? formatInnInput(user.inn) : "";
  let companyName = user?.type === "B2B" && user.name ? user.name : "";
  let fullName = user?.type !== "B2B" && user?.name ? user.name : "";
  let phone = user?.phone ? formatUzPhoneInput(user.phone) : "+998 ";

  if (typeof window !== "undefined") {
    try {
      const rawProfile = localStorage.getItem("sora_checkout_profile");
      if (rawProfile) {
        const parsed = JSON.parse(rawProfile) as {
          fullName?: string;
          phone?: string;
          companyName?: string;
          companyInn?: string;
        };
        if (!fullName && parsed.fullName) fullName = parsed.fullName;
        if (!companyName && parsed.companyName) companyName = parsed.companyName;
        if (!companyInn && parsed.companyInn) {
          companyInn = formatInnInput(parsed.companyInn);
        }
        if (phone.trim() === "+998" && parsed.phone) {
          phone = formatUzPhoneInput(parsed.phone);
        }
      }
    } catch {
      // ignore storage errors
    }
  }

  return { companyInn, companyName, fullName, phone };
}

export function CommercialOfferModal({
  isOpen,
  onClose,
  locale,
}: CommercialOfferModalProps) {
  const isUz = locale === "uz";
  const { items, editingKpOrderId, setEditingKpOrderId } = useCartStore();
  const { user, setUser, sendOtp, verifyOtp } = useAuthStore();

  // Form state initialized cleanly on mount (since CartSummary conditionally mounts modal when open)
  const [initialProfile] = useState(() => readInitialKpProfile(user));
  const [companyInn, setCompanyInn] = useState(initialProfile.companyInn);
  const [companyName, setCompanyName] = useState(initialProfile.companyName);
  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [phone, setPhone] = useState(initialProfile.phone);
  const [showBankFields, setShowBankFields] = useState(false);
  const [bankAccount, setBankAccount] = useState("");
  const [bankMfo, setBankMfo] = useState("");
  const [legalAddress, setLegalAddress] = useState("");

  // View & format settings (Presentation -> PDF, Compact -> Excel)
  const [format, setFormat] = useState<"pdf" | "excel">("pdf");
  const [vatMode, setVatMode] = useState<KpVatMode>("included");
  const [docLocale, setDocLocale] = useState<"uz" | "ru">(locale);

  // OTP & submission state
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [verifiedPhoneToken, setVerifiedPhoneToken] = useState("");
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(60);
  const [otpDevCode, setOtpDevCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [redownloading, setRedownloading] = useState<"" | "pdf" | "excel">("");
  const [error, setError] = useState("");
  const [createdResult, setCreatedResult] = useState<CreatedKpSuccess | null>(
    null
  );
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting && !otpModalOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, submitting, otpModalOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const cleanInn = companyInn.replace(/\D/g, "");
  const normalizedPhone = normalizeUzPhone(phone);
  const isPhoneAlreadyVerified =
    (Boolean(user?.phone) &&
      normalizeUzPhone(user?.phone || "") === normalizedPhone) ||
    (Boolean(verifiedPhoneToken) && verifiedPhone === normalizedPhone);

  const validateFields = (): string | null => {
    if (cleanInn.length !== 9) {
      return isUz
        ? "Tashkilotning 9 xonali STIR (INN) raqamini kiriting."
        : "Введите 9-значный ИНН организации.";
    }
    if (companyName.trim().length < 2) {
      return isUz
        ? "Tashkilot nomini to‘liq kiriting."
        : "Введите наименование организации.";
    }
    if (fullName.trim().length < 2) {
      return isUz
        ? "Mas’ul shaxs F.I.Sh. ni kiriting."
        : "Введите Ф.И.О. ответственного лица.";
    }
    if (!isValidUzPhone(phone)) {
      return isUz
        ? "Telefon raqamini to‘liq kiriting (+998 XX XXX-XX-XX)."
        : "Введите полный номер телефона (+998 XX XXX-XX-XX).";
    }
    if (items.length === 0) {
      return isUz ? "Savatcha bo‘sh!" : "Корзина пуста!";
    }
    return null;
  };

  const downloadKpFile = async (
    docData: KpDocumentData,
    targetFormat: "pdf" | "excel"
  ) => {
    if (targetFormat === "pdf") {
      const { generateAndDownloadKpPdf } = await import("@/lib/kp/generate-pdf");
      await generateAndDownloadKpPdf(docData);
      reachGoal("KP_DOWNLOAD_PDF", {
        orderNumber: docData.orderNumber,
        itemsCount: docData.items.length,
      });
    } else {
      const { generateAndDownloadKpExcel } = await import(
        "@/lib/kp/generate-excel"
      );
      await generateAndDownloadKpExcel(docData);
      reachGoal("KP_DOWNLOAD_EXCEL", {
        orderNumber: docData.orderNumber,
        itemsCount: docData.items.length,
      });
    }
  };

  const createAndDownloadKp = async (tokenOverride?: string) => {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/kp/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          companyInn: cleanInn,
          fullName: fullName.trim(),
          phone,
          bankAccount: bankAccount.trim(),
          bankMfo: bankMfo.trim(),
          legalAddress: legalAddress.trim(),
          vatMode,
          docLocale,
          format,
          verifiedPhoneToken: tokenOverride || verifiedPhoneToken || undefined,
          editingKpOrderId: editingKpOrderId || undefined,
          items: items.map((item) => ({
            id: item.id,
            name: docLocale === "ru" ? item.name_ru || item.name : item.name_uz || item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        if (res.status === 401 && data.code === "PHONE_VERIFICATION_REQUIRED") {
          setSubmitting(false);
          await triggerSmsChallenge();
          return;
        }
        setError(
          data.error ||
            (isUz
              ? "Tijorat taklifini yaratib bo‘lmadi"
              : "Не удалось сформировать КП")
        );
        setSubmitting(false);
        return;
      }

      if (data.session_user) {
        setUser(data.session_user);
      }
      if (editingKpOrderId) {
        setEditingKpOrderId(null);
      }

      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : SORA_COMPANY_INFO.website;
      const publicPath =
        data.public_path || `/${docLocale}/kp/${data.public_token}`;
      const publicUrl = `${origin}${publicPath}`;

      const docData: KpDocumentData = {
        orderNumber: data.order_number,
        createdAtIso: new Date().toISOString(),
        validUntilIso: data.kp_valid_until,
        docLocale,
        vatMode,
        publicUrl,
        totalAmountOverride:
          typeof data.total_amount === "number" ? data.total_amount : undefined,
        customer: {
          companyName: companyName.trim(),
          companyInn: cleanInn,
          contactName: fullName.trim(),
          phone: normalizedPhone,
          bankAccount: bankAccount.trim() || null,
          bankMfo: bankMfo.trim() || null,
          legalAddress: legalAddress.trim() || null,
        },
        items: items.map((item) => ({
          id: item.id,
          sku: item.sku,
          name:
            docLocale === "ru"
              ? item.name_ru || item.name
              : item.name_uz || item.name,
          slug:
            docLocale === "ru"
              ? item.slug_ru || item.slug
              : item.slug_uz || item.slug,
          picture: item.picture,
          unit:
            docLocale === "ru"
              ? item.unit_ru || item.unit || "шт"
              : item.unit_uz || item.unit || "dona",
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const resultPayload: CreatedKpSuccess = {
        orderNumber: data.order_number,
        kpValidUntil: data.kp_valid_until,
        publicToken: data.public_token,
        publicPath,
        publicUrl,
        docData,
        format,
      };
      setCreatedResult(resultPayload);

      try {
        await downloadKpFile(docData, format);
      } catch {
        setError(
          isUz
            ? "Tijorat taklifi yaratildi, biroq faylni avtomatik yuklab bo‘lmadi. Quyidagi tugmalar orqali qayta yuklab oling."
            : "КП сформировано, но не удалось автоматически скачать файл. Скачайте его кнопками ниже."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isUz
            ? "Fayl yaratishda xatolik yuz berdi"
            : "Ошибка при формировании файла"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const triggerSmsChallenge = async () => {
    setSubmitting(true);
    setError("");
    const res = await sendOtp({
      phone: normalizedPhone,
      type: "B2B",
      inn: cleanInn,
      locale,
    });
    setSubmitting(false);

    if (!res.success) {
      setError(
        res.error ||
          (isUz ? "SMS kod yuborishda xatolik" : "Ошибка отправки СМС-кода")
      );
      return;
    }

    setOtpCooldown(res.cooldown ?? 60);
    setOtpDevCode(res.devCode || "");
    setOtpModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErr = validateFields();
    if (validationErr) {
      setError(validationErr);
      return;
    }

    if (isPhoneAlreadyVerified) {
      await createAndDownloadKp();
    } else {
      await triggerSmsChallenge();
    }
  };

  const handleRedownload = async (target: "pdf" | "excel") => {
    if (!createdResult || redownloading === target) return;
    setRedownloading(target);
    setError("");
    try {
      await downloadKpFile(createdResult.docData, target);
    } catch {
      setError(
        isUz
          ? "Faylni qayta yuklashda xatolik"
          : "Ошибка повторной загрузки файла"
      );
    } finally {
      setRedownloading((curr) => (curr === target ? "" : curr));
    }
  };

  const handleCopyPublicLink = () => {
    if (!createdResult) return;
    navigator.clipboard.writeText(createdResult.publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
        onClick={() => {
          if (!submitting) onClose();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="kp-modal-title"
          className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-7 space-y-5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Header */}
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-sora-50 dark:bg-sora-950/50 border border-sora-200/70 dark:border-sora-800 flex items-center justify-center text-sora-600 dark:text-sora-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2
                  id="kp-modal-title"
                  className="text-lg sm:text-xl font-black text-slate-900 dark:text-white"
                >
                  {isUz
                    ? "Tijorat taklifi (KP) olish"
                    : "Получить коммерческое предложение (КП)"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isUz
                    ? "1C bazasida narxlar 5 kunga kafolatlanadi · QR-kodli PDF yoki Excel"
                    : "Цены фиксируются в 1С на 5 дней · PDF с QR-кодом или Excel"}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              aria-label={isUz ? "Yopish" : "Закрыть"}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {editingKpOrderId && !createdResult && (
            <div className="rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 px-4 py-2.5 text-xs text-violet-800 dark:text-violet-300 font-medium">
              {isUz
                ? "Siz mavjud KP hujjatini tahrirlayapsiz — yangi KP yaratilishi bilan eski hujjat avtomatik bekor qilinadi."
                : "Вы редактируете существующее КП — после создания нового документа прежнее КП будет автоматически отменено."}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-4 py-3 text-xs sm:text-sm text-rose-700 dark:text-rose-300"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Screen */}
          {createdResult ? (
            <div className="space-y-5 py-2">
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-base font-black text-emerald-900 dark:text-emerald-200">
                    {isUz
                      ? `Tijorat taklifi #${createdResult.orderNumber} yaratildi va yuklab olindi!`
                      : `Коммерческое предложение №${createdResult.orderNumber} сформировано и скачано!`}
                  </div>
                  <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
                    {isUz
                      ? "Narxlar 1C tizimida saqlandi. QR-kod havolasini rahbariyatga yuborishingiz mumkin."
                      : "Цены зафиксированы в 1С. Вы можете отправить ссылку QR-кода руководству."}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {isUz
                    ? "Ommaviy QR-tekshiruv havolasi:"
                    : "Публичная ссылка QR-паспорта:"}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdResult.publicUrl}
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-700 dark:text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleCopyPublicLink}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold cursor-pointer shrink-0"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isUz ? "Nusxalandi" : "Скопировано"}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{isUz ? "Nusxalash" : "Копировать"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={redownloading === "pdf"}
                    onClick={() => void handleRedownload("pdf")}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sora-600 hover:bg-sora-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    {redownloading === "pdf" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileText className="w-3.5 h-3.5" />
                    )}
                    <span>{isUz ? "PDF qayta yuklash" : "Скачать PDF"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={redownloading === "excel"}
                    onClick={() => void handleRedownload("excel")}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    {redownloading === "excel" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    )}
                    <span>{isUz ? "Excel (.xlsx)" : "Excel (.xlsx)"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/kp/${createdResult.publicToken}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold"
                  >
                    <span>{isUz ? "Pasportni ochish" : "Открыть паспорт"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/orders"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span>{isUz ? "Kabinetga o‘tish" : "Мои КП"}</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
              {/* Block 1: Mandatory B2B Organization Requisites */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-sora-600" />
                    <span>
                      {isUz
                        ? "1. Tashkilot ma’lumotlari (B2B majburiy)"
                        : "1. Данные организации (обязательно для КП)"}
                    </span>
                  </h3>
                  {isPhoneAlreadyVerified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {isUz ? "Tasdiqlangan" : "Подтверждён"}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isUz ? "STIR / INN (9 raqam) *" : "ИНН (9 цифр) *"}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={9}
                      required
                      value={companyInn}
                      onChange={(e) => setCompanyInn(formatInnInput(e.target.value))}
                      placeholder="305123456"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sora-500/30 focus:border-sora-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isUz ? "Tashkilot nomi *" : "Наименование организации *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder={
                        isUz ? "Masalan: «Alpha Service» MCHJ" : "Например: ООО «Alpha Service»"
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sora-500/30 focus:border-sora-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isUz ? "Mas’ul shaxs F.I.Sh. *" : "Ф.И.О. ответственного лица *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={isUz ? "Alisher Valiyev" : "Алишер Валиев"}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sora-500/30 focus:border-sora-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isUz ? "Telefon raqami *" : "Номер телефона *"}
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(formatUzPhoneInput(e.target.value))}
                      placeholder="+998 90 123-45-67"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sora-500/30 focus:border-sora-500"
                    />
                  </div>
                </div>

                {/* Expandable optional bank fields */}
                <button
                  type="button"
                  onClick={() => setShowBankFields((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sora-600 dark:text-sora-400 hover:text-sora-700 cursor-pointer"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      showBankFields ? "rotate-180" : ""
                    }`}
                  />
                  <span>
                    {isUz
                      ? "Bank rekvizitlari va yuridik manzil (ixtiyoriy)"
                      : "Банковские реквизиты и юр. адрес (необязательно)"}
                  </span>
                </button>

                {showBankFields && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        {isUz ? "Hisob raqami (H/R)" : "Расчётный счёт (Р/с)"}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={20}
                        value={bankAccount}
                        onChange={(e) =>
                          setBankAccount(e.target.value.replace(/\D/g, "").slice(0, 20))
                        }
                        placeholder="20208000..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        {isUz ? "Bank MFO" : "МФО банка"}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={5}
                        value={bankMfo}
                        onChange={(e) =>
                          setBankMfo(e.target.value.replace(/\D/g, "").slice(0, 5))
                        }
                        placeholder="01036"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        {isUz ? "Yuridik manzil" : "Юридический адрес"}
                      </label>
                      <input
                        type="text"
                        maxLength={120}
                        value={legalAddress}
                        onChange={(e) => setLegalAddress(e.target.value)}
                        placeholder={isUz ? "Toshkent sh..." : "г. Ташкент..."}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Block 2: View Mode -> Exclusive Format Selection */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isUz
                    ? "2. Ko‘rinish va hujjat formati"
                    : "2. Вид таблицы и формат документа"}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormat("pdf")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer space-y-1.5 ${
                      format === "pdf"
                        ? "border-sora-600 bg-sora-50/60 dark:bg-sora-950/30"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-sm font-black text-slate-900 dark:text-white">
                        <FileText className="w-4 h-4 text-sora-600" />
                        {isUz ? "Rasmli jadval" : "С фото (Презентация)"}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-black">
                        PDF
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {isUz
                        ? "Rahbariyatga taqdim etish uchun rasmlar, muhr/imzo va QR-kod bilan (faqat PDF)."
                        : "Для руководителя: с фото товаров, подписью и QR-кодом (только PDF)."}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat("excel")}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer space-y-1.5 ${
                      format === "excel"
                        ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-sm font-black text-slate-900 dark:text-white">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        {isUz ? "Ixcham jadval" : "Компактная таблица"}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                        EXCEL .XLSX
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {isUz
                        ? "Buxgalteriya va tender uchun tirik formulali ixcham jadval (faqat Excel)."
                        : "Для бухгалтерии и тендеров с живыми формулами (только Excel)."}
                    </p>
                  </button>
                </div>
              </div>

              {/* Block 3: VAT Mode & Document Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isUz ? "QQS (12%) ko‘rinishi" : "Отображение НДС (12%)"}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setVatMode("included")}
                      className={`py-2 px-2 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                        vatMode === "included"
                          ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                          : "text-slate-500"
                      }`}
                    >
                      {isUz ? "Narx ichida" : "В т.ч. НДС"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setVatMode("separate")}
                      className={`py-2 px-2 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                        vatMode === "separate"
                          ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                          : "text-slate-500"
                      }`}
                    >
                      {isUz ? "Alohida ustunda" : "Отдельной графой"}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isUz ? "Hujjat tili" : "Язык документа"}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setDocLocale("uz")}
                      className={`py-2 px-2 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                        docLocale === "uz"
                          ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                          : "text-slate-500"
                      }`}
                    >
                      O‘zbekcha (UZ)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocLocale("ru")}
                      className={`py-2 px-2 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                        docLocale === "ru"
                          ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                          : "text-slate-500"
                      }`}
                    >
                      Русский (RU)
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 ${
                    format === "pdf"
                      ? "bg-sora-600 hover:bg-sora-700 shadow-sora-500/25"
                      : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25"
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        {isUz
                          ? "1C da ro‘yxatga olinmoqda va fayl tayyorlanmoqda..."
                          : "Регистрация в 1С и генерация файла..."}
                      </span>
                    </>
                  ) : format === "pdf" ? (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>
                        {isUz
                          ? "PDF Tijorat taklifini yuklab olish"
                          : "Скачать КП в формате PDF"}
                      </span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>
                        {isUz
                          ? "Excel (.xlsx) Tijorat taklifini yuklab olish"
                          : "Скачать КП в формате Excel (.xlsx)"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Inline SMS OTP Verification when phone/B2B is not verified yet */}
      <CheckoutOtpModal
        isOpen={otpModalOpen}
        locale={locale}
        formattedPhone={formatUzPhoneInput(phone)}
        normalizedPhone={normalizedPhone}
        customerType="B2B"
        companyInn={cleanInn}
        initialCooldown={otpCooldown}
        devCode={otpDevCode}
        isSubmittingOrderAfterVerify={true}
        onClose={() => setOtpModalOpen(false)}
        onResend={() =>
          sendOtp({
            phone: normalizedPhone,
            type: "B2B",
            inn: cleanInn,
            locale,
          })
        }
        onVerify={async (code) => {
          const res = await verifyOtp({
            phone: normalizedPhone,
            code,
            type: "B2B",
            inn: cleanInn,
            locale,
          });
          if (res.success && res.verifiedToken) {
            setVerifiedPhone(normalizedPhone);
            setVerifiedPhoneToken(res.verifiedToken);
            setOtpModalOpen(false);
            await createAndDownloadKp(res.verifiedToken);
          }
          return res;
        }}
      />
    </>,
    document.body
  );
}
