import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import "../globals.css";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext", "cyrillic-ext"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

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
      process.env.NEXT_PUBLIC_SITE_URL || "https://sora.uz"
    ),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        uz: "/uz",
        "uz-UZ": "/uz",
        ru: "/ru",
        "ru-UZ": "/ru",
        "x-default": "/uz",
      },
    },
    icons: {
      icon: [
        { url: "/for_web_logo_icon.ico", sizes: "any" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      shortcut: "/for_web_logo_icon.ico",
      apple: "/for_web_logo_icon.ico",
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
    <html lang={locale} className={`h-full ${fontSans.variable}`}>
      <head>
        {/* Favicon & Title Icon */}
        <link rel="icon" href="/for_web_logo_icon.ico" sizes="any" />
        <link rel="shortcut icon" href="/for_web_logo_icon.ico" />
        <link rel="apple-touch-icon" href="/for_web_logo_icon.ico" />

        {/* Preconnect to external image servers and 1C API to reduce LCP */}
        <link rel="preconnect" href="https://i.ibb.co" />
        <link rel="dns-prefetch" href="https://i.ibb.co" />
        <link rel="preconnect" href="http://1cloud.uz:777" />
        <link rel="dns-prefetch" href="http://1cloud.uz:777" />
      </head>
      <body className={`min-h-full flex flex-col antialiased selection:bg-sora-600 selection:text-white ${fontSans.className}`}>
        <OrganizationJsonLd />
        <GoogleAnalytics />
        <NextIntlClientProvider messages={messages}>
          <NuqsAdapter>{children}</NuqsAdapter>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
