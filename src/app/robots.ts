import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const commonDisallow = [
    "/uz/cart",
    "/ru/cart",
    "/uz/checkout",
    "/ru/checkout",
    "/uz/favorites",
    "/ru/favorites",
    "/uz/compare",
    "/ru/compare",
    "/uz/search",
    "/ru/search",
    "/api/",
    "/*?*brand=",
    "/*?*sort=",
    "/*?*minPrice=",
    "/*?*maxPrice=",
    "/*?*inStock=",
  ];

  const commonAllow = [
    "/",
    "/llms.txt",
    "/llms-full.txt",
    "/*.md",
    "/api/feeds/",
    "/api/md/",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: commonAllow,
        disallow: commonDisallow,
      },
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ClaudeBot",
          "PerplexityBot",
          "Applebot-Extended",
          "Google-Extended",
        ],
        allow: commonAllow,
        disallow: [
          "/uz/cart",
          "/ru/cart",
          "/uz/checkout",
          "/ru/checkout",
          "/api/order/",
          "/api/auth/",
        ],
      },
    ],
    sitemap: "https://sora.uz/sitemap.xml",
    host: "https://sora.uz",
  };
}
