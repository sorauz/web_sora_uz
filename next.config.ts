import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://mc.yandex.ru https://va.vercel-scripts.com https://unpkg.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
      "img-src 'self' data: blob: https://cdn.sora.uz https://res.cloudinary.com https://i.ibb.co https://sora.uz https://www.googletagmanager.com https://www.google-analytics.com https://mc.yandex.ru https://tile.openstreetmap.org https://server.arcgisonline.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://cdn.sora.uz https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://mc.yandex.ru https://mc.yandex.uz https://mc.yandex.com https://va.vercel-scripts.com https://vitals.vercel-insights.com https://nominatim.openstreetmap.org http://1cloud.uz:777 https://1cloud.uz",
      "media-src 'self' https://cdn.sora.uz",
      "frame-src 'self' https://mc.yandex.ru",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000, // 30 days (cuts Vercel Image Optimization re-runs & Fast Data Transfer)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sora.uz",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "sora.uz",
      },
      {
        protocol: "http",
        hostname: "sora.uz",
      },
      {
        protocol: "https",
        hostname: "1cloud.uz",
      },
      {
        protocol: "http",
        hostname: "1cloud.uz",
      },
    ],
  },
  async headers() {
    return [
      {
        // Global Security Headers for all routes
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Edge CDN caching for public category, catalog, and brand pages (cuts Fast Origin Transfer by 80-90%)
        source: "/:locale(uz|ru)/category/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=600, stale-while-revalidate=3600",
          },
        ],
      },
      {
        source: "/:locale(uz|ru)/catalog/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=600, stale-while-revalidate=3600",
          },
        ],
      },
      {
        source: "/:locale(uz|ru)/brand/:slug*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=600, stale-while-revalidate=3600",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/:locale(uz|ru)/products/:slug.md",
        destination: "/api/md/:locale/products/:slug",
      },
      {
        source: "/products/:slug.md",
        destination: "/api/md/uz/products/:slug",
      },
      {
        source: "/:locale(uz|ru)/category/:slug.md",
        destination: "/api/md/:locale/category/:slug",
      },
      {
        source: "/category/:slug.md",
        destination: "/api/md/uz/category/:slug",
      },
    ];
  },
};

export default withNextIntl(nextConfig);
