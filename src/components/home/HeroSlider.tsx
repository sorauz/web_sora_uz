"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Percent,
  Building2,
  Award,
  Truck,
  ArrowRight,
  Send,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { HERO_SLIDES, HeroSlideKey } from "./hero-slides.data";

const AUTOPLAY_INTERVAL_MS = 6000;
const SWIPE_THRESHOLD_PX = 45;

export function HeroSlider() {
  const t = useTranslations("home");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const slideCount = HERO_SLIDES.length;

  const goToSlide = useCallback(
    (index: number) => {
      setActiveIndex(((index % slideCount) + slideCount) % slideCount);
    },
    [slideCount]
  );

  const nextSlide = useCallback(() => {
    goToSlide(activeIndex + 1);
  }, [activeIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(activeIndex - 1);
  }, [activeIndex, goToSlide]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current !== null && touchStartY.current !== null) {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;

      // Only trigger horizontal swipe if horizontal movement dominates vertical scroll
      if (
        Math.abs(deltaX) > SWIPE_THRESHOLD_PX &&
        Math.abs(deltaX) > Math.abs(deltaY)
      ) {
        if (deltaX < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
    setIsPaused(false);
  };

  const renderBadgeIcon = (id: HeroSlideKey, className: string) => {
    switch (id) {
      case "sale":
        return <Percent className={className} />;
      case "b2b":
        return <Building2 className={className} />;
      case "deli":
        return <Award className={className} />;
      case "delivery":
        return <Truck className={className} />;
    }
  };

  const renderPrimaryCtaIcon = (id: HeroSlideKey) => {
    switch (id) {
      case "b2b":
        return <Building2 className="w-4 h-4 shrink-0" />;
      case "deli":
        return <Award className="w-4 h-4 shrink-0" />;
      default:
        return <ArrowRight className="w-4 h-4 shrink-0" />;
    }
  };

  const renderMiniBadgeIcon = (id: HeroSlideKey, colorClass: string) => {
    const cls = `w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${colorClass}`;
    switch (id) {
      case "b2b":
        return <ShieldCheck className={cls} />;
      case "delivery":
        return <Truck className={cls} />;
      default:
        return <CheckCircle2 className={cls} />;
    }
  };

  const currentSlide = HERO_SLIDES[activeIndex];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Hero Banner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`group relative rounded-2xl sm:rounded-3xl bg-gradient-to-br ${currentSlide.bgGradient} text-white overflow-hidden p-4 sm:p-10 lg:px-14 lg:py-11 shadow-xl min-h-[380px] sm:min-h-[440px] lg:min-h-[480px] flex flex-col justify-between transition-colors duration-700 select-none`}
    >
      {/* Dynamic Radial Aura */}
      <div
        className={`absolute right-0 top-0 w-2/3 h-full bg-radial ${currentSlide.auraGradient} pointer-events-none transition-opacity duration-700`}
      />

      {/* Previous / Next Navigation Arrows (Desktop & Tablet) */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label={t("sliderPrev")}
        className="hidden sm:flex absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white/10 hover:bg-white/25 border border-white/15 backdrop-blur-md text-white items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-300 shadow-lg cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label={t("sliderNext")}
        className="hidden sm:flex absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white/10 hover:bg-white/25 border border-white/15 backdrop-blur-md text-white items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-300 shadow-lg cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slides Viewport */}
      <div className="relative z-10 flex-1 flex items-center">
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === activeIndex;
          const TitleTag = idx === 0 ? "h1" : "h2";

          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${idx + 1} / ${slideCount}`}
              aria-hidden={!isActive}
              className={`w-full grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center transition-all duration-500 ease-out ${
                isActive
                  ? "opacity-100 translate-x-0 relative pointer-events-auto"
                  : "opacity-0 translate-x-4 absolute inset-0 pointer-events-none"
              }`}
            >
              {/* Left Column: Text & CTAs */}
              <div className="lg:col-span-7 space-y-2.5 sm:space-y-4">
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold border backdrop-blur-xs ${slide.badgeClass}`}
                >
                  {renderBadgeIcon(
                    slide.id,
                    `w-3.5 h-3.5 shrink-0 ${slide.badgeIconColor}`
                  )}
                  <span>{t(`slides.${slide.id}.badge`)}</span>
                </div>

                <TitleTag className="text-xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-snug sm:leading-tight">
                  {t(`slides.${slide.id}.title`)}
                </TitleTag>

                <p className="text-xs sm:text-base text-slate-200/90 max-w-xl leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {t(`slides.${slide.id}.subtitle`)}
                </p>

                <div className="pt-1 sm:pt-2 flex flex-wrap gap-2 sm:gap-3">
                  <Link
                    href={slide.primaryCtaHref}
                    tabIndex={isActive ? 0 : -1}
                    className={`px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 sm:gap-2 ${slide.primaryCtaClass}`}
                  >
                    <span>{t(`slides.${slide.id}.primaryCta`)}</span>
                    {renderPrimaryCtaIcon(slide.id)}
                  </Link>

                  {slide.secondaryExternal ? (
                    <a
                      href={slide.secondaryCtaHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={isActive ? 0 : -1}
                      className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-xs transition-all flex items-center gap-1.5 sm:gap-2"
                    >
                      <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>{t(`slides.${slide.id}.secondaryCta`)}</span>
                    </a>
                  ) : (
                    <Link
                      href={slide.secondaryCtaHref}
                      tabIndex={isActive ? 0 : -1}
                      className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-xs transition-all flex items-center gap-1.5 sm:gap-2"
                    >
                      <span>{t(`slides.${slide.id}.secondaryCta`)}</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Right Column: Glassmorphism Frame & 3D Visual Showcase */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-48 sm:w-80 lg:w-96 h-40 sm:h-72 lg:h-80 bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 border border-white/15 shadow-2xl flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <Image
                      src={slide.image}
                      alt={t(`slides.${slide.id}.imageAlt`)}
                      fill
                      sizes="(max-width: 640px) 192px, (max-width: 1024px) 320px, 384px"
                      className="object-contain p-1 sm:p-2 drop-shadow-[0_25px_35px_rgba(0,0,0,0.45)] transition-transform duration-500 group-hover:scale-103"
                      priority={idx === 0}
                      loading={idx === 0 ? undefined : "lazy"}
                    />
                  </div>

                  {/* Floating Mini-Badge */}
                  <div className="absolute -bottom-2.5 -left-2.5 sm:-bottom-3.5 sm:-left-3.5 bg-white text-slate-900 rounded-xl sm:rounded-2xl py-1 px-2.5 sm:py-2 sm:px-4 shadow-xl border border-slate-100 text-[10px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2">
                    {renderMiniBadgeIcon(slide.id, slide.miniBadgeIconColor)}
                    <span>{t(`slides.${slide.id}.miniBadge`)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Progress Pill Indicators */}
      <div
        role="tablist"
        aria-label="Slide indicators"
        className="relative z-20 pt-4 sm:pt-6 flex items-center justify-center gap-2 sm:gap-2.5"
      >
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Slide ${idx + 1}: ${t(`slides.${slide.id}.badge`)}`}
              onClick={() => goToSlide(idx)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 overflow-hidden cursor-pointer ${
                isActive
                  ? "w-8 sm:w-11 bg-white/30"
                  : "w-2 sm:w-2.5 bg-white/25 hover:bg-white/45"
              }`}
            >
              {isActive && (
                <span
                  className={`block h-full w-full rounded-full ${slide.progressBarColor} transition-all`}
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
