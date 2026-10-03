import { CategoryTreeNode } from "@/lib/schemas/category";
import { Link } from "@/i18n/routing";
import { Folder, ChevronRight } from "lucide-react";

interface CategoryCardProps {
  category: CategoryTreeNode;
  locale: "uz" | "ru";
}

export function CategoryCard({ category, locale }: CategoryCardProps) {
  const isUz = locale === "uz";
  const name = isUz ? category.group_uz : category.group_ru;
  const slug = isUz ? category.group_slug_uz : category.group_slug_ru;
  const subCount = category.children.length;

  return (
    <Link
      href={`/category/${slug}`}
      className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sora-400 dark:hover:border-sora-600 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-sora-50 dark:bg-sora-950/60 text-sora-600 dark:text-sora-400 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Folder className="w-5 h-5" />
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sora-600 dark:group-hover:text-sora-400 group-hover:translate-x-0.5 transition-all" />
      </div>

      <div>
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-sora-600 dark:group-hover:text-sora-400 transition-colors line-clamp-2">
          {name}
        </h3>
        {subCount > 0 && (
          <p className="text-xs text-slate-500 mt-1">
            {subCount} {isUz ? "ta ichki bo'lim" : "подкатегорий"}
          </p>
        )}
      </div>
    </Link>
  );
}
