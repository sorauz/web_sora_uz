"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";

interface AuditLoginGateProps {
  locale: "uz" | "ru";
}

export function AuditLoginGate({ locale }: AuditLoginGateProps) {
  const router = useRouter();
  const isUz = locale === "uz";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!password.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/internal-audit/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(
          data?.error ||
            (isUz
              ? "Kirish kaliti noto‘g‘ri. Qaytadan urinib ko‘ring."
              : "Неверный ключ доступа. Попробуйте ещё раз."),
        );
        setIsSubmitting(false);
        return;
      }

      router.refresh();
    } catch {
      setError(
        isUz
          ? "Tarmoq xatoligi yuz berdi. Qaytadan urinib ko‘ring."
          : "Ошибка сети. Попробуйте ещё раз.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white mb-5 mx-auto">
          <Lock className="w-6 h-6" />
        </div>

        <h1 className="text-xl font-bold text-slate-900 text-center">
          {isUz
            ? "Ichki Katalog va Merchant Auditi"
            : "Внутренний аудит каталога и Merchant"}
        </h1>
        <p className="text-sm text-slate-600 text-center mt-2">
          {isUz
            ? "Ushbu yopiq bo‘limga kirish uchun maxfiy audit kalitini kiriting."
            : "Введите секретный ключ аудита для доступа к закрытой панели."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="audit-password"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              {isUz ? "Kirish kaliti" : "Ключ доступа"}
            </label>
            <div className="relative">
              <input
                id="audit-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                placeholder={isUz ? "Kalitni kiriting..." : "Введите ключ..."}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword
                    ? isUz
                      ? "Parolni yashirish"
                      : "Скрыть пароль"
                    : isUz
                      ? "Parolni ko‘rsatish"
                      : "Показать пароль"
                }
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-800"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !password.trim()}
            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isSubmitting
              ? isUz
                ? "Tekshirilmoqda..."
                : "Проверка..."
              : isUz
                ? "Tizimga kirish"
                : "Войти"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {isUz
              ? "Qidiruv tizimlari uchun yopiq (noindex, nofollow)"
              : "Закрыто от индексации (noindex, nofollow)"}
          </span>
        </div>
      </div>
    </main>
  );
}
