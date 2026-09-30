import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
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
};

export default withNextIntl(nextConfig);
