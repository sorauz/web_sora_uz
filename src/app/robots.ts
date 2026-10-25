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
      // AI Search & Real-time Assistant Bots (Send traffic and live citations to Sora.uz)
      {
        userAgent: [
          "OAI-SearchBot",
          "PerplexityBot",
          "ClaudeBot",
          "ChatGPT-User",
        ],
        allow: commonAllow,
        disallow: [
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
          "/api/order/",
          "/api/auth/",
        ],
      },
      // AI Training & Scraper Bots (Separated: Directed to structured Markdown & llms.txt, blocked from heavy query params & internal carts)
      {
        userAgent: [
          "GPTBot",
          "Google-Extended",
          "Applebot-Extended",
          "CCBot",
          "Bytespider",
          "anthropic-ai",
        ],
        allow: [
          "/llms.txt",
          "/llms-full.txt",
          "/*.md",
          "/api/md/",
        ],
        disallow: [
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
        ],
      },
    ],
    sitemap: "https://sora.uz/sitemap.xml",
    host: "https://sora.uz",
  };
}
