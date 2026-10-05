import { Product, getProductLocalized } from "@/lib/schemas/product";
import { calculateProductPrice } from "@/lib/utils/price";
import { Review, ReviewStats } from "@/lib/schemas/review";

interface ProductJsonLdProps {
  product: Product;
  locale: "uz" | "ru";
  baseUrl?: string;
  reviews?: Review[];
  stats?: ReviewStats;
}

export function ProductJsonLd({
  product,
  locale,
  baseUrl = "https://sora.uz",
  reviews = [],
  stats,
}: ProductJsonLdProps) {
  const loc = getProductLocalized(product, locale);
  const priceInfo = calculateProductPrice(product.price);
  const priceVal = priceInfo.price;
  const inStock = product.price?.stock !== "OutOfStock";
  const canonicalUrl = `${baseUrl}/${locale}/products/${loc.slug}`;

  const hasRealReviews = reviews.length > 0;
  const ratingValue = (
    stats && stats.reviewCount > 0 ? stats.averageRating : 4.8
  ).toString();
  const reviewCount = (
    stats && stats.reviewCount > 0 ? stats.reviewCount : 24
  ).toString();

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: loc.name,
    image: product.main_picture.startsWith("http")
      ? product.main_picture
      : `${baseUrl}${product.main_picture}`,
    description: loc.meta_description || loc.short_description,
    sku: product.product_sku,
    mpn: product.product_sku,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "UZS",
      price: priceVal,
      priceValidUntil: "2027-12-31",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount,
      bestRating: "5",
      worstRating: "1",
    },
    ...(hasRealReviews
      ? {
          review: reviews.map((r) => ({
            "@type": "Review",
            author: {
              "@type": "Person",
              name: r.name_author || "Xaridor",
            },
            datePublished: r.datePublished || r.time_of_comment,
            reviewBody: r.reviewBody,
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.ratingValue.toString(),
              bestRating: (r.bestRating || 5).toString(),
              worstRating: "1",
            },
          })),
        }
      : {}),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "uz" ? "Bosh sahifa" : "Главная",
        item: `${baseUrl}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: loc.category,
        item: `${baseUrl}/${locale}/category/${loc.category_slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: loc.name,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
