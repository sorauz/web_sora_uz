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
          "Claude-SearchBot",
          "Claude-User",
          "ChatGPT-User",
        ],
        allow: commonAllow,
        disallow: commonDisallow,
      },
      // AI Training & Scraper Bots (Completely blocked from model pre-training / bulk dataset scraping)
      {
        userAgent: [
          "ClaudeBot",
          "GPTBot",
          "Google-Extended",
          "Applebot-Extended",
          "CCBot",
          "Bytespider",
          "anthropic-ai",
        ],
        disallow: ["/"],
      },
    ],
    sitemap: "https://sora.uz/sitemap.xml",
    host: "https://sora.uz",
  };
}
