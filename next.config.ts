import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000, // 30 days (cuts Vercel Image Optimization re-runs & Fast Data Transfer)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
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
};

export default withNextIntl(nextConfig);
