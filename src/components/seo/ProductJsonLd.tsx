import { Product, getProductLocalized } from "@/lib/schemas/product";
import { calculateProductPrice } from "@/lib/utils/price";
import {
  getValidGtin,
  getValidMpn,
  resolveProductImageUrl,
} from "@/lib/utils/merchant";
import {
  Review,
  ReviewStats,
  DEFAULT_BEST_RATING,
  DEFAULT_WORST_RATING,
} from "@/lib/schemas/review";

interface ProductJsonLdProps {
  product: Product;
  locale: "uz" | "ru";
  baseUrl?: string;
  reviews?: Review[];
  stats?: ReviewStats;
  breadcrumbItems?: { name: string; href?: string }[];
}

export function ProductJsonLd({
  product,
  locale,
  baseUrl = "https://sora.uz",
  reviews = [],
  stats,
  breadcrumbItems,
}: ProductJsonLdProps) {
  const loc = getProductLocalized(product, locale);
  const priceInfo = calculateProductPrice(product.price);
  const priceVal = priceInfo.price;
  const hasValidPrice = Number.isFinite(priceVal) && priceVal > 0;
  const inStock = product.price?.stock !== "OutOfStock";
  const canonicalUrl = `${baseUrl}/${locale}/products/${loc.slug}`;

  const hasRealReviews = reviews.length > 0;
  const hasAggregateRating = Boolean(stats && stats.reviewCount > 0);
  // Google Product Snippets require at least one of offers, review, or aggregateRating.
  const canEmitProductSchema =
    hasValidPrice || hasRealReviews || hasAggregateRating;
  const isUz = locale === "uz";

  // Build Schema.org PropertyValue array for AI & Search Engine crawlers
  const additionalProperties: {
    "@type": "PropertyValue";
    name: string;
    value: string;
  }[] = [];

  if (product.country) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: isUz ? "Ishlab chiqarilgan davlat" : "Страна производства",
      value: product.country,
    });
  }
  if (product.manufacturer) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: isUz ? "Ishlab chiqaruvchi" : "Производитель",
      value: product.manufacturer,
    });
  }
  if (product.package) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: isUz ? "Qadoqda" : "Упаковка",
      value: product.package,
    });
  }
  if (loc.unit) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: isUz ? "O'lchov birligi" : "Единица измерения",
      value: loc.unit,
    });
  }
  if (product.attributes && product.attributes.length > 0) {
    for (const attr of product.attributes) {
      const propName =
        (isUz ? attr.property_uz : attr.property_ru) ||
        attr.property_uz ||
        attr.property_ru;
      const propVal =
        (isUz ? attr.value_uz : attr.value_ru) ||
        attr.value_uz ||
        attr.value_ru;
      if (propName?.trim() && propVal?.trim()) {
        additionalProperties.push({
          "@type": "PropertyValue",
          name: propName.trim(),
          value: propVal.trim(),
        });
      }
    }
  }

  const validGtin = getValidGtin(product.barcode);
  const validMpn = getValidMpn(product.product_sku);
  const resolvedImage = resolveProductImageUrl(product.main_picture, {
    updatedAt: product.updated_at,
    baseUrl,
    fallbackUrl: `${baseUrl}/og-image.jpg`,
  });

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: loc.name,
    image: resolvedImage,
    description: loc.meta_description || loc.short_description,
    ...(validMpn ? { sku: validMpn, mpn: validMpn } : {}),
    category: loc.category,
    ...(validGtin
      ? {
          gtin: validGtin,
          ...(validGtin.length === 13 ? { gtin13: validGtin } : {}),
        }
      : {}),
    brand: {
      "@type": "Brand",
      name: product.brand || "Sora",
    },
    ...(additionalProperties.length > 0
      ? { additionalProperty: additionalProperties }
      : {}),
    ...(hasValidPrice
      ? {
          offers: {
            "@type": "Offer",
            url: canonicalUrl,
            priceCurrency: "UZS",
            price: priceVal,
            valueAddedTaxIncluded: true,
            priceValidUntil: "2027-12-31",
            availability: inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: {
              "@type": "Organization",
              name: "Sora.uz",
              url: baseUrl,
            },
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: {
                "@type": "MonetaryAmount",
                value: "0",
                currency: "UZS",
              },
              shippingDestination: {
                "@type": "DefinedRegion",
                addressCountry: "UZ",
              },
              deliveryTime: {
                "@type": "ShippingDeliveryTime",
                handlingTime: {
                  "@type": "QuantitativeValue",
                  minValue: 0,
                  maxValue: 1,
                  unitCode: "DAY",
                },
                transitTime: {
                  "@type": "QuantitativeValue",
                  minValue: 1,
                  maxValue: 3,
                  unitCode: "DAY",
                },
              },
            },
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "UZ",
              returnPolicyCategory:
                "https://schema.org/MerchantReturnFiniteReturnWindow",
              merchantReturnDays: 10,
              returnMethod: "https://schema.org/ReturnByMail",
              returnFees: "https://schema.org/FreeReturn",
            },
          },
        }
      : {}),
    ...(stats && stats.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: stats.averageRating.toString(),
            reviewCount: stats.reviewCount.toString(),
            bestRating: DEFAULT_BEST_RATING.toString(),
            worstRating: DEFAULT_WORST_RATING.toString(),
          },
        }
      : {}),
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
              bestRating: (r.bestRating ?? DEFAULT_BEST_RATING).toString(),
              worstRating: (r.worstRating ?? DEFAULT_WORST_RATING).toString(),
            },
          })),
        }
      : {}),
  };

  const breadcrumbElements =
    breadcrumbItems && breadcrumbItems.length > 0
      ? [
          {
            "@type": "ListItem",
            position: 1,
            name: locale === "uz" ? "Bosh sahifa" : "Главная",
            item: `${baseUrl}/${locale}`,
          },
          ...breadcrumbItems.map((b, idx) => ({
            "@type": "ListItem",
            position: idx + 2,
            name: b.name,
            item: b.href
              ? b.href.startsWith("http")
                ? b.href
                : `${baseUrl}/${locale}${b.href}`
              : canonicalUrl,
          })),
        ]
      : [
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
        ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbElements,
  };

  return (
    <>
      {canEmitProductSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
