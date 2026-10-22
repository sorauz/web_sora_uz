"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ArrowUpRight } from "lucide-react";
import { CategoryVisual } from "@/lib/data/category-visuals";

interface CategoryVisualCardProps {
  category: CategoryVisual;
  locale: "uz" | "ru";
  count?: number;
}

export function CategoryVisualCard({
  category,
  locale,
  count,
}: CategoryVisualCardProps) {
  const isUz = locale === "uz";
  const slug = isUz ? category.slugUz : category.slugRu;
  const title = isUz ? category.titleUz : category.titleRu;
  const tags = isUz ? category.tagsUz : category.tagsRu;
  const badge = isUz ? category.badgeUz : category.badgeRu;
  const itemCount = count ?? category.defaultCount;

  return (
    <Link
      href={`/category/${slug}`}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 transition-all duration-300 hover:shadow-lg ${category.borderHover} active:scale-[0.98] select-none`}
    >
      {/* Background Soft Subtle Gradient Tint */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient} opacity-60 pointer-events-none transition-opacity duration-300 group-hover:opacity-100`}
      />

      {/* Top Header: Title, Count, Badge, and Arrow Action */}
      <div className="relative z-10 flex items-start justify-between gap-2">
        <div className="space-y-1">
          {badge && (
            <span
              className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${category.badgeBg} shadow-2xs mb-0.5`}
            >
              {badge}
            </span>
          )}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-sora-600 transition-colors">
            {title}
          </h3>
          <p className="text-xs font-medium text-slate-500">
            {isUz
              ? `${itemCount} xil tovar`
              : `${itemCount} товаров`}
          </p>
        </div>

        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 group-hover:text-sora-600 group-hover:border-sora-300 flex items-center justify-center shrink-0 shadow-xs transition-all duration-200">
          <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>

      {/* Center Showcase: Real 3D Product Image */}
      <div className="relative z-10 my-3 flex items-center justify-center aspect-square w-full max-w-[210px] mx-auto">
        <div className="relative w-full h-full transition-transform duration-300 group-hover:scale-105">
          <Image
            src={category.image}
            alt={title}
            fill
            sizes="(max-width: 640px) 150px, (max-width: 1024px) 180px, 210px"
            className="object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.06)]"
            loading="lazy"
          />
        </div>
      </div>

      {/* Bottom Footer: Quick Category Sub-Tags */}
      <div className="relative z-10 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-1.5">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-semibold text-slate-600 bg-white/90 border border-slate-200/80 px-2 py-0.5 rounded-md shadow-2xs truncate max-w-[140px]"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-[10px] font-bold text-slate-400 px-1">
              +{tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
