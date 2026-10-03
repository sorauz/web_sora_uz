"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTransition } from "react";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = (nextLocale: "uz" | "ru") => {
    if (nextLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium">
      <Globe className="w-4 h-4 ml-1.5 text-slate-500" />
      <button
        onClick={() => toggleLocale("uz")}
        disabled={isPending}
        className={`px-2.5 py-1 rounded-md transition-all ${
          locale === "uz"
            ? "bg-white dark:bg-slate-900 text-sora-600 dark:text-sora-400 shadow-xs font-semibold"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
        }`}
      >
        O&apos;zbek
      </button>
      <button
        onClick={() => toggleLocale("ru")}
        disabled={isPending}
        className={`px-2.5 py-1 rounded-md transition-all ${
          locale === "ru"
            ? "bg-white dark:bg-slate-900 text-sora-600 dark:text-sora-400 shadow-xs font-semibold"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
        }`}
      >
        Русский
      </button>
    </div>
  );
}
