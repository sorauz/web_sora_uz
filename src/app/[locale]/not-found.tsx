import { Link } from "@/i18n/routing";
import { Search, Home, ShoppingBag, ArrowRight } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-16 text-center">
      <div className="max-w-md w-full space-y-6">
        {/* 404 Badge */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-sora-50 dark:bg-sora-950/60 text-sora-600 dark:text-sora-400 font-black text-4xl shadow-inner border border-sora-100 dark:border-sora-900/60">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Sahifa topilmadi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Kechirasiz, siz qidirayotgan sahifa o&apos;chirilgan, nomi o&apos;zgargan yoki vaqtincha mavjud emas.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-sora-600 hover:bg-sora-700 text-white font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Bosh sahifaga qaytish</span>
          </Link>
          <Link
            href="/catalog"
            className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sora-500 font-semibold text-sm text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Katalogga o&apos;tish</span>
          </Link>
        </div>

        {/* Popular Categories */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 text-left">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">
            Ommabop bo&apos;limlar
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/category/ish-stoli-kalkulyatorlari"
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-sora-600 hover:border-sora-400 transition-colors"
            >
              Kalkulyatorlar
            </Link>
            <Link
              href="/category/magnit-va-marker-doskalari"
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-sora-600 hover:border-sora-400 transition-colors"
            >
              Namoyish doskalari
            </Link>
            <Link
              href="/brands"
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-sora-600 hover:border-sora-400 transition-colors"
            >
              Barcha brendlar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
