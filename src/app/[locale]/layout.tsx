import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isUz = locale === "uz";

  return {
    title: {
      template: "%s | Sora.uz",
      default: isUz
        ? "Sora.uz — Kanselyariya va Elektronika Internet Do'koni"
        : "Sora.uz — Интернет-магазин канцелярии и электроники",
    },
    description: isUz
      ? "Sora.uz — 1C ERP integratsiyali zamonaviy internet do'koni. Ofis anjomlari, kanselyariya va elektronika mahsulotlari arzon narxlarda."
      : "Sora.uz — современный интернет-магазин с интеграцией 1С ERP. Офисные товары, канцелярия и электроника по доступным ценам.",
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "https://websorauz.vercel.app"
    ),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        uz: "/uz",
        ru: "/ru",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "uz" | "ru")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full">
      <body className="min-h-full flex flex-col antialiased selection:bg-blue-600 selection:text-white">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
