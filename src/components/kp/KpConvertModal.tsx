"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useAuthStore } from "@/lib/store/auth";
import { CheckoutOtpModal } from "@/components/checkout/CheckoutOtpModal";
import type { OneCOrderActionResponse } from "@/lib/schemas/order";
import {
  formatUzPhoneInput,
  isValidUzPhone,
  normalizeUzPhone,
} from "@/lib/utils/phone";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  Store,
  Truck,
  X,
} from "lucide-react";

interface KpConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  locale: "uz" | "ru";
  publicToken?: string;
  requiresPhoneOtp: boolean;
  defaultWithoutDelivery?: boolean;
  onConverted: (res: OneCOrderActionResponse) => void;
}

export function KpConvertModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  locale,
  publicToken,
  requiresPhoneOtp,
  defaultWithoutDelivery = true,
  onConverted,
}: KpConvertModalProps) {
  const isUz = locale === "uz";
  const { sendOtp, verifyOtp } = useAuthStore();

  const [withoutDelivery, setWithoutDelivery] = useState(
    defaultWithoutDelivery
  );
  const [addressOrGeo, setAddressOrGeo] = useState("");
  const [comment, setComment] = useState("");
  const [phone, setPhone] = useState("+998 ");

  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [verifiedPhoneToken, setVerifiedPhoneToken] = useState("");
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(60);
  const [otpDevCode, setOtpDevCode] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || typeof document === "undefined") return null;

  const normalizedPhone = normalizeUzPhone(phone);
  const otpSatisfied =
    !requiresPhoneOtp ||
    (Boolean(verifiedPhoneToken) && verifiedPhone === normalizedPhone);

  const performConversion = async (tokenOverride?: string, phoneOverride?: string) => {
    setSubmitting(true);
    setError("");

    const combinedComment = [
      !withoutDelivery && addressOrGeo.trim()
        ? `Manzil: ${addressOrGeo.trim()}`
        : "",
      comment.trim(),
    ]
      .filter(Boolean)
      .join(". ")
      .slice(0, 350);

    try {
      const res = await fetch("/api/kp/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          action: "CONVERT_TO_ORDER",
          ...(publicToken ? { publicToken } : {}),
          ...(tokenOverride || verifiedPhoneToken
            ? {
                verifiedPhoneToken: tokenOverride || verifiedPhoneToken,
                verifiedPhone: phoneOverride || verifiedPhone || normalizedPhone,
              }
            : {}),
          withoutDelivery,
          geolocation: withoutDelivery ? "" : addressOrGeo.trim().slice(0, 150),
          ...(combinedComment ? { comment: combinedComment } : {}),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        if (res.status === 401 && data.code === "PHONE_VERIFICATION_REQUIRED") {
          setSubmitting(false);
          setError(
            isUz
              ? "Tasdiqlash uchun telefon raqamingizni kiriting va SMS kodni tasdiqlang."
              : "Для подтверждения введите номер телефона и подтвердите СМС-код."
          );
          return;
        }
        setError(
          data.error ||
            (isUz
              ? "Tijorat taklifini buyurtmaga aylantirib bo‘lmadi"
              : "Не удалось перевести КП в заказ")
        );
        setSubmitting(false);
        return;
      }

      onConverted(data as OneCOrderActionResponse);
      onClose();
    } catch {
      setError(
        isUz
          ? "Tarmoq xatosi yuz berdi. Qayta urinib ko‘ring."
          : "Сетевая ошибка. Попробуйте снова."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otpSatisfied) {
      if (!isValidUzPhone(phone)) {
        setError(
          isUz
            ? "Tasdiqlash uchun to‘liq telefon raqamini kiriting (+998 XX XXX-XX-XX)."
            : "Введите полный номер телефона для подтверждения."
        );
        return;
      }

      setSubmitting(true);
      const otpRes = await sendOtp({
        phone: normalizedPhone,
        type: "B2B",
        locale,
      });
      setSubmitting(false);

      if (!otpRes.success) {
        setError(
          otpRes.error ||
            (isUz ? "SMS yuborishda xatolik" : "Ошибка отправки СМС")
        );
        return;
      }

      setOtpCooldown(otpRes.cooldown ?? 60);
      setOtpDevCode(otpRes.devCode || "");
      setOtpModalOpen(true);
      return;
    }

    await performConversion();
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
        onClick={() => {
          if (!submitting) onClose();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-1 pr-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {isUz
                ? `KP #${orderNumber} ni buyurtmaga aylantirish`
                : `Оформить заказ по КП №${orderNumber}`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isUz
                ? "KP dagi kafolatlangan narxlar saqlangan holda 1C da haqiqiy buyurtma ochiladi."
                : "В 1С будет создан заказ по зафиксированным в КП ценам."}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3.5 py-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {isUz ? "Yetkazib berish usuli" : "Способ получения"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWithoutDelivery(false)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                    !withoutDelivery
                      ? "border-sora-600 bg-sora-50 dark:bg-sora-950/40 text-sora-700 dark:text-sora-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>{isUz ? "Kuryer orqali" : "Курьером"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWithoutDelivery(true)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                    withoutDelivery
                      ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>{isUz ? "O‘zi olib ketish" : "Самовывоз"}</span>
                </button>
              </div>
            </div>

            {!withoutDelivery && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sora-600" />
                    {isUz
                      ? "Manzil yoki koordinata (ixtiyoriy)"
                      : "Адрес или координаты (необязательно)"}
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={150}
                  value={addressOrGeo}
                  onChange={(e) => setAddressOrGeo(e.target.value)}
                  placeholder={
                    isUz
                      ? "Toshkent sh., Mustaqillik 15"
                      : "г. Ташкент, ул. Мустакиллик 15"
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isUz ? "Buyurtma izohi (ixtiyoriy)" : "Комментарий к заказу"}
              </label>
              <textarea
                rows={2}
                maxLength={250}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  isUz
                    ? "Masalan: Ertaga soat 10:00 gacha yetkazib bering"
                    : "Например: Доставить завтра до 10:00"
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white resize-none"
              />
            </div>

            {requiresPhoneOtp && !otpSatisfied && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2">
                <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                  {isUz
                    ? "Xavfsizlik uchun telefoningizni SMS kod orqali tasdiqlang:"
                    : "Для безопасности подтвердите ваш телефон по СМС:"}
                </p>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(formatUzPhoneInput(e.target.value))}
                  placeholder="+998 90 123-45-67"
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-sora-600 hover:bg-sora-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-sora-500/20 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {isUz ? "Tasdiqlanmoqda..." : "Оформление..."}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {otpSatisfied
                      ? isUz
                        ? "Xaridni tasdiqlash"
                        : "Подтвердить заказ"
                      : isUz
                        ? "SMS kod olish va tasdiqlash"
                        : "Получить СМС-код и подтвердить"}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <CheckoutOtpModal
        isOpen={otpModalOpen}
        locale={locale}
        formattedPhone={formatUzPhoneInput(phone)}
        normalizedPhone={normalizedPhone}
        customerType="B2B"
        initialCooldown={otpCooldown}
        devCode={otpDevCode}
        isSubmittingOrderAfterVerify={true}
        onClose={() => setOtpModalOpen(false)}
        onResend={() =>
          sendOtp({
            phone: normalizedPhone,
            type: "B2B",
            locale,
          })
        }
        onVerify={async (code) => {
          const res = await verifyOtp({
            phone: normalizedPhone,
            code,
            type: "B2B",
            locale,
          });
          if (res.success && res.verifiedToken) {
            setVerifiedPhone(normalizedPhone);
            setVerifiedPhoneToken(res.verifiedToken);
            setOtpModalOpen(false);
            await performConversion(res.verifiedToken, normalizedPhone);
          }
          return res;
        }}
      />
    </>,
    document.body
  );
}
