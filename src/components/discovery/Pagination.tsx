"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  className?: string;
  baseUrl?: string;
  searchParams?: Record<string, string | string[] | undefined>;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 24,
  className = "",
  baseUrl,
  searchParams: serverSearchParams,
}: PaginationProps) {
  const t = useTranslations("pagination");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  // Create clean page URL keeping existing filter/sort query params
  const createPageUrl = (pageNumber: number) => {
    let params: URLSearchParams;
    if (serverSearchParams) {
      params = new URLSearchParams();
      Object.entries(serverSearchParams).forEach(([k, v]) => {
        if (v !== undefined) {
          if (Array.isArray(v)) {
            v.forEach((val) => params.append(k, val));
          } else {
            params.set(k, v);
          }
        }
      });
    } else {
      params = new URLSearchParams(searchParams.toString());
    }

    if (pageNumber <= 1) {
      params.delete("page");
    } else {
      params.set("page", pageNumber.toString());
    }
    const rawTarget = baseUrl ?? pathname;
    // Ensure leading slash and strip any leading locale (/uz or /ru)
    // because next-intl's Link component automatically prepends the active locale.
    const cleanPath = rawTarget.startsWith("/") ? rawTarget : `/${rawTarget}`;
    const targetPath = cleanPath.replace(/^\/(uz|ru)(\/|$)/, "/");
    const queryString = params.toString();
    return queryString ? `${targetPath}?${queryString}` : targetPath;
  };

  const fromItem = (currentPage - 1) * pageSize + 1;
  const toItem = Math.min(currentPage * pageSize, totalItems);

  // Generate pagination page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Range around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always include last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      aria-label="Sahifalash"
      className={`pt-6 pb-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      {/* Showing info count */}
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 order-2 sm:order-1">
        {t("showing", {
          from: fromItem,
          to: toItem,
          total: totalItems,
        })}
      </div>

      {/* Pagination buttons */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
        {/* Previous Button (44px touch target) */}
        {hasPrev ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            rel="prev"
            aria-label={t("prev")}
            className="min-w-11 min-h-11 sm:min-w-10 sm:min-h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sora-500 hover:text-sora-600 transition-colors flex items-center justify-center text-xs font-semibold shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{t("prev")}</span>
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="min-w-11 min-h-11 sm:min-w-10 sm:min-h-10 px-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-100/50 dark:bg-slate-900/40 text-slate-300 dark:text-slate-600 cursor-not-allowed flex items-center justify-center text-xs font-medium"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{t("prev")}</span>
          </span>
        )}

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((item, idx) => {
            if (item === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-10 flex items-center justify-center text-slate-400"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              );
            }

            const isCurrent = item === currentPage;

            return isCurrent ? (
              <span
                key={item}
                aria-current="page"
                className="min-w-11 min-h-11 sm:min-w-10 sm:min-h-10 rounded-xl bg-sora-600 text-white font-bold flex items-center justify-center text-xs shadow-xs"
              >
                {item}
              </span>
            ) : (
              <Link
                key={item}
                href={createPageUrl(item)}
                aria-label={`${t("page")} ${item}`}
                className="min-w-11 min-h-11 sm:min-w-10 sm:min-h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sora-500 hover:text-sora-600 transition-colors flex items-center justify-center text-xs font-semibold shadow-2xs"
              >
                {item}
              </Link>
            );
          })}
        </div>

        {/* Next Button (44px touch target) */}
        {hasNext ? (
          <Link
            href={createPageUrl(currentPage + 1)}
            rel="next"
            aria-label={t("next")}
            className="min-w-11 min-h-11 sm:min-w-10 sm:min-h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sora-500 hover:text-sora-600 transition-colors flex items-center justify-center text-xs font-semibold shadow-2xs"
          >
            <span className="hidden sm:inline">{t("next")}</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="min-w-11 min-h-11 sm:min-w-10 sm:min-h-10 px-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-slate-100/50 dark:bg-slate-900/40 text-slate-300 dark:text-slate-600 cursor-not-allowed flex items-center justify-center text-xs font-medium"
          >
            <span className="hidden sm:inline">{t("next")}</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </span>
        )}
      </div>
    </nav>
  );
}
