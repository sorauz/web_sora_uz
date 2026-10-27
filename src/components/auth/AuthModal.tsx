"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useAuthStore } from "@/lib/store/auth";
import { reachGoal } from "@/lib/analytics/yandex";
import {
  X,
  User,
  Phone,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface AuthModalProps {
  locale?: "uz" | "ru";
}

type OtpStep = "phone" | "otp" | "profile";

/**
 * Formats phone input into readable "+998 XX XXX-XX-XX"
 */
function formatUzPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  let local = digits;
  if (local.startsWith("998")) {
    local = local.slice(3);
  } else if (local.startsWith("8") && local.length > 9) {
    local = local.slice(1);
  }
  local = local.slice(0, 9);

  if (local.length === 0) return "+998 ";
  if (local.length <= 2) return `+998 ${local}`;
  if (local.length <= 5) return `+998 ${local.slice(0, 2)} ${local.slice(2)}`;
  if (local.length <= 7)
    return `+998 ${local.slice(0, 2)} ${local.slice(2, 5)}-${local.slice(5)}`;
  return `+998 ${local.slice(0, 2)} ${local.slice(2, 5)}-${local.slice(
    5,
    7
  )}-${local.slice(7, 9)}`;
}

export function AuthModal({ locale = "uz" }: AuthModalProps) {
  const isUz = locale === "uz";
  const {
    isModalOpen,
    modalType,
    isLoading,
    closeModal,
    setModalType,
    sendOtp,
    verifyOtp,
    completeOtpRegistration,
  } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 3-step state
  const [step, setStep] = useState<OtpStep>("phone");
  const [phone, setPhone] = useState("+998 ");
  const [inn, setInn] = useState("");
  const [name, setName] = useState("");
  const [otpDigits, setOtpDigits] = useState<[string, string, string, string]>([
    "",
    "",
    "",
    "",
  ]);
  const [verifiedToken, setVerifiedToken] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [devCodeHint, setDevCodeHint] = useState<string | undefined>(undefined);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const otpInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Reset modal errors when opened
  useEffect(() => {
    if (isModalOpen) {
      setErrorMessage("");
      setSuccessMessage("");
    }
  }, [isModalOpen]);

  // Cooldown 1-second timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, closeModal]);

  const submitOtpCode = useCallback(
    async (fullCode: string) => {
      if (fullCode.length !== 4 || isLoading) return;
      setErrorMessage("");
      setSuccessMessage("");

      const res = await verifyOtp({
        phone,
        code: fullCode,
        type: modalType,
        inn: modalType === "B2B" ? inn : undefined,
        locale,
      });

      if (!res.success) {
        setErrorMessage(
          res.error || (isUz ? "Tasdiqlash kodi xato" : "Неверный код")
        );
        // Clear digits on failure and focus first box
        setOtpDigits(["", "", "", ""]);
        setTimeout(() => otpInputRefs[0].current?.focus(), 50);
        return;
      }

      reachGoal("OTP_VERIFIED", { type: modalType });

      if (res.isNewUser && res.verifiedToken) {
        setVerifiedToken(res.verifiedToken);
        setStep("profile");
        setSuccessMessage(
          isUz
            ? "Raqam tasdiqlandi! Endi ism-sharifingizni kiriting."
            : "Номер подтвержден! Пожалуйста, укажите ваше имя."
        );
      } else {
        reachGoal("USER_LOGGED_IN", { type: modalType });
      }
    },
    [phone, modalType, inn, locale, isUz, isLoading, verifyOtp]
  );

  // WebOTP API for mobile 1-tap SMS autofill (Chrome Android / Safari iOS)
  useEffect(() => {
    if (step !== "otp" || !isModalOpen) return;
    if (typeof window === "undefined" || !("OTPCredential" in window)) return;

    const abortController = new AbortController();
    navigator.credentials
      .get({
        // @ts-expect-error WebOTP API transport option
        otp: { transport: ["sms"] },
        signal: abortController.signal,
      })
      .then((credential) => {
        const otpCred = credential as { code?: string } | null;
        if (otpCred?.code && /^\d{4}$/.test(otpCred.code)) {
          const chars = otpCred.code.split("") as [
            string,
            string,
            string,
            string
          ];
          setOtpDigits(chars);
          void submitOtpCode(otpCred.code);
        }
      })
      .catch(() => {
        // Ignore abort or unsupported browser
      });

    return () => abortController.abort();
  }, [step, isModalOpen, submitOtpCode]);

  if (!isModalOpen || !mounted) return null;

  // Step 1: Request SMS OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length !== 12) {
      setErrorMessage(
        isUz
          ? "Iltimos, 9 xonali telefon raqamingizni to'liq kiriting"
          : "Пожалуйста, введите полный номер телефона"
      );
      return;
    }

    if (modalType === "B2B" && inn.trim().length > 0 && !/^\d{9}$/.test(inn.trim())) {
      setErrorMessage(
        isUz
          ? "STIR (INN) 9 ta raqamdan iborat bo'lishi kerak"
          : "ИНН должен состоять из 9 цифр"
      );
      return;
    }

    const res = await sendOtp({
      phone,
      type: modalType,
      inn: modalType === "B2B" ? inn.trim() : undefined,
      locale,
    });

    if (!res.success) {
      if (res.retryAfter) {
        setCooldown(res.retryAfter);
      }
      setErrorMessage(
        res.error || (isUz ? "Xatolik yuz berdi" : "Произошла ошибка")
      );
      return;
    }

    reachGoal("OTP_SENT", { type: modalType });
    setCooldown(res.cooldown ?? 60);
    setDevCodeHint(res.devCode);
    setOtpDigits(["", "", "", ""]);
    setStep("otp");

    setTimeout(() => {
      otpInputRefs[0].current?.focus();
    }, 80);
  };

  // Pin Input Handlers
  const handleDigitChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      const next = [...otpDigits] as [string, string, string, string];
      next[index] = "";
      setOtpDigits(next);
      return;
    }

    // If user pasted or auto-filled multiple digits into a single box
    if (clean.length >= 4) {
      const four = clean.slice(0, 4).split("") as [
        string,
        string,
        string,
        string
      ];
      setOtpDigits(four);
      otpInputRefs[3].current?.focus();
      void submitOtpCode(clean.slice(0, 4));
      return;
    }

    const digit = clean.slice(-1);
    const next = [...otpDigits] as [string, string, string, string];
    next[index] = digit;
    setOtpDigits(next);

    if (index < 3 && digit) {
      otpInputRefs[index + 1].current?.focus();
    }

    const joined = next.join("");
    if (joined.length === 4) {
      void submitOtpCode(joined);
    }
  };

  const handleDigitKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;

    const next: [string, string, string, string] = ["", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i] || "";
    }
    setOtpDigits(next);

    const focusIdx = Math.min(pasted.length, 3);
    otpInputRefs[focusIdx].current?.focus();

    if (pasted.length === 4) {
      void submitOtpCode(pasted);
    }
  };

  // Step 3: Complete New User Registration
  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (name.trim().length < 2) {
      setErrorMessage(
        isUz
          ? "Iltimos, ism-sharifingizni to'liq kiriting"
          : "Пожалуйста, введите ваше имя"
      );
      return;
    }

    if (modalType === "B2B" && !/^\d{9}$/.test(inn.trim())) {
      setErrorMessage(
        isUz
          ? "Tashkilotning 9 xonali STIR (INN) raqamini kiriting"
          : "Введите 9-значный ИНН организации"
      );
      return;
    }

    const res = await completeOtpRegistration({
      verifiedToken,
      name: name.trim(),
      type: modalType,
      inn: modalType === "B2B" ? inn.trim() : undefined,
    });

    if (!res.success) {
      setErrorMessage(
        res.error || (isUz ? "Xatolik yuz berdi" : "Произошла ошибка")
      );
      return;
    }

    reachGoal("USER_REGISTERED", { type: modalType });
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Step Indicator & Close */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sora-50 dark:bg-sora-950/60 text-sora-600 dark:text-sora-400 text-[11px] font-bold mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {step === "phone"
                  ? isUz
                    ? "SMS orqali tezkor kirish"
                    : "Быстрый вход по СМС"
                  : step === "otp"
                  ? isUz
                    ? "Kodni tasdiqlash"
                    : "Подтверждение кода"
                  : isUz
                  ? "Yangi mijoz ma'lumotlari"
                  : "Данные нового клиента"}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {step === "phone"
                ? isUz
                  ? "Kirish yoki Ro'yxatdan o'tish"
                  : "Вход или Регистрация"
                : step === "otp"
                ? isUz
                  ? "SMS kodni kiriting"
                  : "Введите код из СМС"
                : isUz
                ? "Tanishib olaylik!"
                : "Давайте познакомимся!"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === "phone"
                ? isUz
                  ? "Parolsiz — telefon raqamingizga 4 xonali SMS kod yuboramiz"
                  : "Без пароля — отправим 4-значный СМС-код на ваш номер"
                : step === "otp"
                ? isUz
                  ? `Tasdiqlash kodi ${phone} raqamiga yuborildi`
                  : `Код подтверждения отправлен на номер ${phone}`
                : isUz
                ? "1C ERP tizimida shaxsiy hisobingizni yakunlash uchun"
                : "Для завершения создания профиля в системе 1С ERP"}
            </p>
          </div>
          <button
            onClick={closeModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alert Notifications */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{successMessage}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 pt-4">
          {step === "phone" && (
            /* --- STEP 1: PHONE INPUT --- */
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Type Switcher: B2C vs B2B */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalType("B2C")}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    modalType === "B2C"
                      ? "border-sora-500 bg-sora-50/60 dark:bg-sora-950/40 text-sora-700 dark:text-sora-300 font-bold"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{isUz ? "Jismoniy shaxs" : "Физ. лицо"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalType("B2B")}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    modalType === "B2B"
                      ? "border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{isUz ? "Yuridik shaxs (B2B)" : "Юр. лицо (B2B)"}</span>
                </button>
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isUz ? "Mobil telefon raqamingiz" : "Ваш мобильный телефон"}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatUzPhoneInput(e.target.value))}
                    placeholder="+998 90 123-45-67"
                    required
                    className="ym-disable-keys w-full h-12 pl-10 pr-4 text-base font-semibold tracking-wide rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-sora-500 focus:ring-2 focus:ring-sora-500/20 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Optional INN for B2B on Step 1 */}
              {modalType === "B2B" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isUz
                      ? "Tashkilot STIR (INN) — 9 ta raqam"
                      : "ИНН организации — 9 цифр"}
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={9}
                      value={inn}
                      onChange={(e) =>
                        setInn(e.target.value.replace(/\D/g, "").slice(0, 9))
                      }
                      placeholder="204393073"
                      className="ym-disable-keys w-full h-11 pl-10 pr-4 text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-2 rounded-2xl bg-sora-600 hover:bg-sora-700 active:scale-[0.98] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>
                      {isUz ? "Tasdiqlash kodini olish" : "Получить СМС-код"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === "otp" && (
            /* --- STEP 2: 4-DIGIT OTP PIN INPUT --- */
            <div className="space-y-5">
              {/* Test / Pending Moderation Helper Banner */}
              {devCodeHint && (
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 flex items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {isUz ? "Test rejimi kodi:" : "Тестовый код:"}{" "}
                      <strong className="font-mono text-sm tracking-wider">
                        {devCodeHint}
                      </strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const chars = devCodeHint.split("") as [
                        string,
                        string,
                        string,
                        string
                      ];
                      setOtpDigits(chars);
                      void submitOtpCode(devCodeHint);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] transition-colors cursor-pointer shrink-0"
                  >
                    {isUz ? "Avto-kiritish" : "Вставить"}
                  </button>
                </div>
              )}

              {/* 4 Pin Boxes */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 py-1">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    ref={otpInputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    autoComplete={idx === 0 ? "one-time-code" : "off"}
                    maxLength={4}
                    value={otpDigits[idx]}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                    onPaste={handlePasteOtp}
                    disabled={isLoading}
                    aria-label={`Digit ${idx + 1}`}
                    className="ym-disable-keys w-14 h-16 sm:w-16 sm:h-16 text-center text-2xl font-black rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-sora-600 focus:ring-4 focus:ring-sora-500/15 text-slate-900 dark:text-white transition-all"
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={() => void submitOtpCode(otpDigits.join(""))}
                disabled={isLoading || otpDigits.join("").length !== 4}
                className="w-full h-12 rounded-2xl bg-sora-600 hover:bg-sora-700 active:scale-[0.98] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{isUz ? "Tasdiqlash" : "Подтвердить"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend Timer & Change Phone */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>
                    {isUz ? "Raqamni o'zgartirish" : "Изменить номер"}
                  </span>
                </button>

                {cooldown > 0 ? (
                  <span className="text-slate-400 font-medium">
                    {isUz
                      ? `Qayta yuborish: ${formatTimer(cooldown)}`
                      : `Повторно через ${formatTimer(cooldown)}`}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleSendOtp()}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1 font-bold text-sora-600 dark:text-sora-400 hover:underline cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>
                      {isUz ? "Kodni qayta yuborish" : "Отправить повторно"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {step === "profile" && (
            /* --- STEP 3: NEW CUSTOMER PROFILE COMPLETION --- */
            <form onSubmit={handleCompleteProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {modalType === "B2B"
                    ? isUz
                      ? "Tashkilotning rasmiy nomi"
                      : "Официальное название организации"
                    : isUz
                    ? "Ism va familiyangiz"
                    : "Ваше имя и фамилия"}
                </label>
                <div className="relative">
                  {modalType === "B2B" ? (
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  ) : (
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  )}
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={
                      modalType === "B2B"
                        ? isUz
                          ? '"SORA OFFICE" MCHJ'
                          : 'ООО "SORA OFFICE"'
                        : isUz
                        ? "Jasur Karimov"
                        : "Жасур Каримов"
                    }
                    required
                    autoFocus
                    className="ym-disable-keys w-full h-11 pl-10 pr-4 text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-sora-500 focus:ring-2 focus:ring-sora-500/20 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {modalType === "B2B" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isUz
                      ? "Tashkilot STIR (INN) — 9 xonali"
                      : "ИНН организации — 9 цифр"}
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={9}
                      value={inn}
                      onChange={(e) =>
                        setInn(e.target.value.replace(/\D/g, "").slice(0, 9))
                      }
                      placeholder="204393073"
                      required
                      className="ym-disable-keys w-full h-11 pl-10 pr-4 text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>
                      {isUz ? "Saqlash va davom etish" : "Сохранить и войти"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
