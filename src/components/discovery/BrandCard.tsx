import { Brand } from "@/lib/schemas/brand";
import { Link } from "@/i18n/routing";
import { Award, ChevronRight } from "lucide-react";

interface BrandCardProps {
  brand: Brand;
  productCount?: number;
}

export function BrandCard({ brand, productCount }: BrandCardProps) {
  const brandSlug = brand.name.toLowerCase().replace(/[^a-z0-9]/g, "-");

  return (
    <Link
      href={`/brand/${brandSlug}`}
      className="group flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm tracking-wider">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {brand.name}
          </h4>
          {typeof productCount === "number" && (
            <span className="text-xs text-slate-500">
              {productCount} mahsulot
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}
