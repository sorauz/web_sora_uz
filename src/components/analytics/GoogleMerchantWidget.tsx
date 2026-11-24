"use client";

import { useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { GOOGLE_MERCHANT_ID } from "./GoogleCustomerReviewsOptIn";

interface MerchantWidgetConfig {
  merchant_id: number;
  position?: "RIGHT_BOTTOM" | "LEFT_BOTTOM";
  region?: string;
  sideMargin?: number;
  bottomMargin?: number;
  mobileSideMargin?: number;
  mobileBottomMargin?: number;
}

declare global {
  interface Window {
    __soraMerchantWidgetStarted?: boolean;
    merchantwidget?: {
      start: (config: MerchantWidgetConfig) => void;
    };
  }
}

/**
 * Loads Google Merchant Store Widget badge on public storefront pages.
 * Keeps bottom spacing above mobile navigation bar and skips internal audit routes.
 */
export function GoogleMerchantWidget() {
  const pathname = usePathname();
  const isHiddenRoute = pathname?.includes("/internal-audit") ?? false;

  const startWidget = useCallback(() => {
    if (isHiddenRoute) return;
    if (window.__soraMerchantWidgetStarted) return;
    if (!window.merchantwidget?.start) return;

    window.__soraMerchantWidgetStarted = true;
    try {
      window.merchantwidget.start({
        merchant_id: GOOGLE_MERCHANT_ID,
        position: "LEFT_BOTTOM",
        region: "UZ",
        sideMargin: 16,
        bottomMargin: 16,
        mobileSideMargin: 10,
        mobileBottomMargin: 76,
      });
    } catch {
      // Never allow third-party widget initialization errors to crash React tree
    }
  }, [isHiddenRoute]);

  useEffect(() => {
    if (!isHiddenRoute && window.merchantwidget?.start) {
      startWidget();
    }
  }, [isHiddenRoute, startWidget]);

  if (isHiddenRoute) return null;

  return (
    <Script
      id="merchantWidgetScript"
      src="https://www.gstatic.com/shopping/merchant/merchantwidget.js"
      strategy="lazyOnload"
      onLoad={startWidget}
    />
  );
}
