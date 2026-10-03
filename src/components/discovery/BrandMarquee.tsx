"use client";

import { Brand } from "@/lib/schemas/brand";
import { Link } from "@/i18n/routing";
import { Award } from "lucide-react";
import { useMemo } from "react";

interface BrandMarqueeProps {
  brands: Brand[];
}

/**
 * Ensures minimum items in row before duplicating for infinite seamless 50% translation
 */
function prepareRow(items: Brand[], minCount = 10): Brand[] {
  if (items.length === 0) return [];
  let list = [...items];
  while (list.length < minCount) {
    list = [...list, ...items];
  }
  // Exactly duplicate once for mathematical 50% loop
  return [...list, ...list];
}

function BrandMarqueeItem({ brand }: { brand: Brand }) {
  const brandSlug = brand.name.toLowerCase().replace(/[^a-z0-9]/g, "-");

  return (
    <Link
      href={`/brand/${brandSlug}`}
      className="group inline-flex items-center gap-2.5 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all shrink-0 select-none mr-3 sm:mr-4"
    >
      <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-110 transition-transform">
        <Award className="w-4 h-4" />
      </div>
      <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors whitespace-nowrap">
        {brand.name}
      </span>
    </Link>
  );
}

export function BrandMarquee({ brands }: BrandMarqueeProps) {
  // Partition into 3 balanced rows
  const { row1, row2, row3 } = useMemo(() => {
    const r1: Brand[] = [];
    const r2: Brand[] = [];
    const r3: Brand[] = [];

    brands.forEach((brand, idx) => {
      if (idx % 3 === 0) r1.push(brand);
      else if (idx % 3 === 1) r2.push(brand);
      else r3.push(brand);
    });

    return {
      row1: prepareRow(r1),
      row2: prepareRow(r2),
      row3: prepareRow(r3),
    };
  }, [brands]);

  if (brands.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden py-2 space-y-3">
      {/* Edge gradient masks for seamless visual fade */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-10" />

      {/* Row 1: Right to Left (moving left) */}
      <div className="flex overflow-hidden py-0.5">
        <div className="flex shrink-0 animate-marquee-left marquee-track">
          {row1.map((b, idx) => (
            <BrandMarqueeItem key={`r1-${b.id}-${idx}`} brand={b} />
          ))}
        </div>
      </div>

      {/* Row 2: Left to Right (moving right) */}
      <div className="flex overflow-hidden py-0.5">
        <div className="flex shrink-0 animate-marquee-right marquee-track">
          {row2.map((b, idx) => (
            <BrandMarqueeItem key={`r2-${b.id}-${idx}`} brand={b} />
          ))}
        </div>
      </div>

      {/* Row 3: Right to Left (moving left) */}
      <div className="flex overflow-hidden py-0.5">
        <div className="flex shrink-0 animate-marquee-left-fast marquee-track">
          {row3.map((b, idx) => (
            <BrandMarqueeItem key={`r3-${b.id}-${idx}`} brand={b} />
          ))}
        </div>
      </div>
    </div>
  );
}
