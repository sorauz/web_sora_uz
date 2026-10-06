import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/feeds/"],
        disallow: [
          "/uz/cart",
          "/ru/cart",
          "/uz/checkout",
          "/ru/checkout",
          "/uz/favorites",
          "/ru/favorites",
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
