import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const commonDisallow = [
    "/api/",
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
          "ChatGPT-User",
          "PerplexityBot",
          "Perplexity-User",
          "Claude-SearchBot",
          "Claude-User",
          "GoogleOther",
        ],
        allow: commonAllow,
        disallow: commonDisallow,
      },
      // AI Training & Scraper Bots (Completely blocked from model pre-training / bulk dataset scraping)
      {
        userAgent: [
          "GPTBot",
          "ClaudeBot",
          "Claude-Web",
          "anthropic-ai",
          "Google-Extended",
          "Applebot-Extended",
          "CCBot",
          "Bytespider",
        ],
        disallow: ["/"],
      },
    ],
    sitemap: "https://sora.uz/sitemap.xml",
  };
}
