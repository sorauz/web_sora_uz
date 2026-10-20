export type HeroSlideKey = "sale" | "b2b" | "deli" | "delivery";

export interface HeroSlideConfig {
  id: HeroSlideKey;
  image: string;
  bgGradient: string;
  auraGradient: string;
  badgeClass: string;
  badgeIconColor: string;
  primaryCtaHref: string;
  primaryCtaClass: string;
  secondaryCtaHref: string;
  secondaryExternal?: boolean;
  miniBadgeIconColor: string;
  progressBarColor: string;
}

export const HERO_SLIDES: HeroSlideConfig[] = [
  {
    id: "sale",
    image: "/banners/hero-slide-sale.webp",
    bgGradient: "from-rose-950 via-sora-950 to-slate-950",
    auraGradient: "from-rose-500/25 via-amber-500/10 to-transparent",
    badgeClass: "bg-rose-500/25 border-rose-400/40 text-rose-100",
    badgeIconColor: "text-amber-400",
    primaryCtaHref: "/catalog/promotions",
    primaryCtaClass:
      "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30",
    secondaryCtaHref: "/catalog",
    miniBadgeIconColor: "text-emerald-500",
    progressBarColor: "bg-rose-400",
  },
  {
    id: "b2b",
    image: "/banners/hero-slide-b2b.webp",
    bgGradient: "from-indigo-950 via-slate-900 to-sora-950",
    auraGradient: "from-indigo-500/30 via-sora-500/15 to-transparent",
    badgeClass: "bg-indigo-500/25 border-indigo-400/40 text-indigo-100",
    badgeIconColor: "text-indigo-300",
    primaryCtaHref: "/b2b",
    primaryCtaClass:
      "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30",
    secondaryCtaHref: "https://t.me/sora_uz",
    secondaryExternal: true,
    miniBadgeIconColor: "text-indigo-500",
    progressBarColor: "bg-indigo-400",
  },
  {
    id: "deli",
    image: "/banners/hero-slide-deli.webp",
    bgGradient: "from-amber-950 via-slate-900 to-sora-950",
    auraGradient: "from-amber-400/25 via-orange-500/10 to-transparent",
    badgeClass: "bg-amber-500/25 border-amber-400/40 text-amber-100",
    badgeIconColor: "text-amber-400",
    primaryCtaHref: "/brand/deli",
    primaryCtaClass:
      "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30",
    secondaryCtaHref: "/warranty",
    miniBadgeIconColor: "text-amber-500",
    progressBarColor: "bg-amber-400",
  },
  {
    id: "delivery",
    image: "/banners/hero-slide-delivery.webp",
    bgGradient: "from-emerald-950 via-slate-900 to-sora-950",
    auraGradient: "from-emerald-500/30 via-teal-500/10 to-transparent",
    badgeClass: "bg-emerald-500/25 border-emerald-400/40 text-emerald-100",
    badgeIconColor: "text-emerald-300",
    primaryCtaHref: "/catalog",
    primaryCtaClass:
      "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30",
    secondaryCtaHref: "/delivery",
    miniBadgeIconColor: "text-emerald-500",
    progressBarColor: "bg-emerald-400",
  },
];
