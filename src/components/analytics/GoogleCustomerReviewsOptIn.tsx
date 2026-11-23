"use client";

import { useEffect, useMemo, useRef } from "react";
import Script from "next/script";

export const GOOGLE_MERCHANT_ID = 5882215725;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface GapiSurveyOptInConfig {
  merchant_id: number;
  order_id: string;
  email: string;
  delivery_country: string;
  estimated_delivery_date: string;
  products?: Array<{ gtin: string }>;
}

declare global {
  interface Window {
    ___gcfg?: { lang?: string };
    renderOptIn?: () => void;
    gapi?: {
      load: (module: string, callback: () => void) => void;
      surveyoptin?: {
        render: (config: GapiSurveyOptInConfig) => void;
      };
    };
  }
}

interface GoogleCustomerReviewsOptInProps {
  orderId: string;
  email?: string | null;
  estimatedDeliveryDate: string;
  gtins?: string[];
  locale?: "uz" | "ru";
}

/**
 * Renders Google Customer Reviews survey opt-in dialog on order confirmation.
 * Only activates when a valid customer email and order ID are present, per Google policy.
 */
export function GoogleCustomerReviewsOptIn({
  orderId,
  email,
  estimatedDeliveryDate,
  gtins = [],
  locale = "uz",
}: GoogleCustomerReviewsOptInProps) {
  const renderedOrderIdRef = useRef<string | null>(null);

  const cleanOrderId = orderId.trim();
  const cleanEmail = (email || "").trim();
  const isValid =
    Boolean(cleanOrderId) &&
    EMAIL_RE.test(cleanEmail) &&
    DATE_RE.test(estimatedDeliveryDate);

  const uniqueGtins = useMemo(
    () =>
      Array.from(
        new Set(
          gtins
            .map((g) => g.trim())
            .filter((g) => /^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(g)),
        ),
      ),
    [gtins],
  );

  useEffect(() => {
    if (!isValid) return;

    window.___gcfg = { lang: locale === "ru" ? "ru" : "uz" };

    const triggerRenderOptIn = () => {
      const gapi = window.gapi;
      if (!gapi?.load) return;
      if (renderedOrderIdRef.current === cleanOrderId) return;

      gapi.load("surveyoptin", () => {
        if (renderedOrderIdRef.current === cleanOrderId) return;
        renderedOrderIdRef.current = cleanOrderId;

        window.gapi?.surveyoptin?.render({
          merchant_id: GOOGLE_MERCHANT_ID,
          order_id: cleanOrderId,
          email: cleanEmail,
          delivery_country: "UZ",
          estimated_delivery_date: estimatedDeliveryDate,
          ...(uniqueGtins.length > 0
            ? { products: uniqueGtins.map((gtin) => ({ gtin })) }
            : {}),
        });
      });
    };

    window.renderOptIn = triggerRenderOptIn;

    // Handle SPA navigation when platform.js is already cached in window.gapi
    if (window.gapi?.load) {
      triggerRenderOptIn();
    }
  }, [
    isValid,
    cleanOrderId,
    cleanEmail,
    estimatedDeliveryDate,
    uniqueGtins,
    locale,
  ]);

  if (!isValid) return null;

  return (
    <Script
      id="google-customer-reviews-platform"
      src="https://apis.google.com/js/platform.js?onload=renderOptIn"
      strategy="afterInteractive"
    />
  );
}
