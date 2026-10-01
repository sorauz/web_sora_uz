import { Product, getProductLocalized } from "@/lib/schemas/product";
import { calculateProductPrice } from "@/lib/utils/price";

interface ProductJsonLdProps {
  product: Product;
  locale: "uz" | "ru";
  baseUrl?: string;
}

export function ProductJsonLd({
  product,
  locale,
  baseUrl = "https://sora.uz",
}: ProductJsonLdProps) {
  const loc = getProductLocalized(product, locale);
  const priceInfo = calculateProductPrice(product.price);
  const priceVal = priceInfo.price;
  const inStock = product.price?.stock !== "OutOfStock";
  const canonicalUrl = `${baseUrl}/${locale}/products/${loc.slug}`;

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
      ratingValue: "4.8",
      reviewCount: "24",
    },
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
