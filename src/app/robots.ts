import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/uz/cart",
          "/ru/cart",
          "/uz/checkout",
          "/ru/checkout",
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
