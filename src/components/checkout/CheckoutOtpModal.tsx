"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import type { AuthUser } from "@/lib/schemas/auth";

interface CheckoutOtpModalProps {
  isOpen: boolean;
  locale: "uz" | "ru";
  formattedPhone: string;
  normalizedPhone: string;
  customerType: "B2C" | "B2B";
  companyInn?: string;
  initialCooldown: number;
  devCode?: string;
  isSubmittingOrderAfterVerify: boolean;
  onClose: () => void;
  onResend: () => Promise<{
    success: boolean;
    cooldown?: number;
    devCode?: string;
    error?: string;
  }>;
  onVerify: (code: string) => Promise<{
    success: boolean;
    verifiedToken?: string;
    user?: AuthUser;
    error?: string;
  }>;
}

export function CheckoutOtpModal({
  isOpen,
  locale,
  formattedPhone,
  initialCooldown,
  devCode: initialDevCode,
  isSubmittingOrderAfterVerify,
  onClose,
  onResend,
  onVerify,
}: CheckoutOtpModalProps) {
  const isUz = locale === "uz";
  const [digits, setDigits] = useState<[string, string, string, string]>([
    "",
    "",
    "",
    "",
  ]);
  const [cooldown, setCooldown] = useState(initialCooldown);
  const [devCode, setDevCode] = useState(initialDevCode || "");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const input0 = useRef<HTMLInputElement>(null);
  const input1 = useRef<HTMLInputElement>(null);
  const input2 = useRef<HTMLInputElement>(null);
  const input3 = useRef<HTMLInputElement>(null);
  const inputRefs = [input0, input1, input2, input3];

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => input0.current?.focus(), 60);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, cooldown]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isVerifying) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isVerifying, onClose]);

  if (!isOpen) return null;

  const submitCode = async (code: string) => {
    if (!/^\d{4}$/.test(code) || isVerifying) return;
    setIsVerifying(true);
    setError("");
    const res = await onVerify(code);
    if (!res.success) {
      setError(
        res.error ||
          (isUz
            ? "Tasdiqlash kodi noto‘g‘ri"
            : "Неверный код подтверждения")
      );
      setIsVerifying(false);
      setDigits(["", "", "", ""]);
      setTimeout(() => input0.current?.focus(), 40);
    }
  };

  const handleDigitChange = (index: number, raw: string) => {
    const clean = raw.replace(/\D/g, "");
    if (clean.length > 1) {
      const sliced = clean.slice(0, 4).split("");
      const next: [string, string, string, string] = [
        sliced[0] || "",
        sliced[1] || "",
        sliced[2] || "",
        sliced[3] || "",
      ];
      setDigits(next);
      setError("");
      if (sliced.length >= 4) {
        void submitCode(next.join(""));
      } else {
        inputRefs[Math.min(sliced.length, 3)]?.current?.focus();
      }
      return;
    }

    const next: [string, string, string, string] = [...digits];
    next[index] = clean;
    setDigits(next);
    setError("");

    if (clean && index < 3) {
      inputRefs[index + 1]?.current?.focus();
    }
    const joined = next.join("");
    if (joined.length === 4) {
      void submitCode(joined);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setError("");
    const res = await onResend();
    setIsResending(false);
    if (res.success) {
      setCooldown(res.cooldown ?? 60);
      if (res.devCode) setDevCode(res.devCode);
      setDigits(["", "", "", ""]);
      setTimeout(() => input0.current?.focus(), 40);
    } else {
      setError(
        res.error ||
          (isUz ? "SMS qayta yuborishda xatolik" : "Ошибка повторной отправки СМС")
      );
    }
  };

  const joinedCode = digits.join("");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-otp-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
    >
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 relative">
        <button
          type="button"
          onClick={onClose}
          disabled={isVerifying}
          aria-label={isUz ? "Yopish" : "Закрыть"}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-sora-50 dark:bg-sora-950/50 border border-sora-200/70 dark:border-sora-800 flex items-center justify-center text-sora-600 dark:text-sora-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3
              id="checkout-otp-title"
              className="text-lg font-black text-slate-900 dark:text-white"
            >
              {isUz ? "Telefon raqamini tasdiqlash" : "Подтверждение номера"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isUz
                ? "Buyurtmani rasmiylashtirish uchun 4 xonali SMS kodni kiriting"
                : "Введите 4-значный СМС-код для подтверждения заказа"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 px-4 py-3 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isUz ? "SMS kod quyidagi raqamga yuborildi:" : "СМС-код отправлен на номер:"}
          </p>
          <p className="text-base font-black text-slate-900 dark:text-white mt-0.5 tracking-wide">
            {formattedPhone}
          </p>
        </div>

        {devCode && (
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3.5 py-2 text-xs text-amber-800 dark:text-amber-300 text-center font-medium">
            {isUz ? "Test rejimi kodi:" : "Тестовый код:"}{" "}
            <strong className="font-mono text-sm">{devCode}</strong>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={inputRefs[idx]}
              type="text"
              inputMode="numeric"
              autoComplete={idx === 0 ? "one-time-code" : "off"}
              maxLength={4}
              value={digit}
              disabled={isVerifying}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              aria-label={`SMS kod raqami ${idx + 1}`}
              className="w-13 h-14 text-center text-2xl font-black rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-sora-600 focus:ring-2 focus:ring-sora-500/20 focus:outline-none disabled:opacity-50"
            />
          ))}
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3.5 py-2.5 text-xs text-rose-600 dark:text-rose-400"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          disabled={joinedCode.length !== 4 || isVerifying}
          onClick={() => void submitCode(joinedCode)}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-sora-600 hover:bg-sora-700 text-white font-bold text-sm shadow-md shadow-sora-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                {isSubmittingOrderAfterVerify
                  ? isUz
                    ? "Tasdiqlanmoqda va buyurtma yuborilmoqda..."
                    : "Проверка и оформление заказа..."
                  : isUz
                    ? "Tekshirilmoqda..."
                    : "Проверка..."}
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmittingOrderAfterVerify
                  ? isUz
                    ? "Tasdiqlash va buyurtmani yuborish"
                    : "Подтвердить и оформить заказ"
                  : isUz
                    ? "Kodni tasdiqlash"
                    : "Подтвердить код"}
              </span>
            </>
          )}
        </button>

        <div className="flex items-center justify-center">
          <button
            type="button"
            disabled={cooldown > 0 || isResending || isVerifying}
            onClick={() => void handleResend()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sora-600 dark:text-sora-400 hover:text-sora-700 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
            <span>
              {cooldown > 0
                ? isUz
                  ? `Qayta yuborish (${cooldown} s)`
                  : `Отправить повторно (${cooldown} с)`
                : isUz
                  ? "SMS kodni qayta yuborish"
                  : "Отправить СМС-код повторно"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
