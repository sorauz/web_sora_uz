import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
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
    ],
  },
};

export default withNextIntl(nextConfig);
