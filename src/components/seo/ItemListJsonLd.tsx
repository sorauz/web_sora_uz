import { Product, getProductLocalized } from "@/lib/schemas/product";
import { calculateProductPrice } from "@/lib/utils/price";
import { getValidMpn, resolveProductImageUrl } from "@/lib/utils/merchant";

interface ItemListJsonLdProps {
  name: string;
  description?: string;
  products: Product[];
  locale: "uz" | "ru";
  baseUrl?: string;
  currentPage?: number;
  pageSize?: number;
}

export function ItemListJsonLd({
  name,
  description,
  products,
  locale,
  baseUrl = "https://sora.uz",
  currentPage = 1,
  pageSize = 24,
}: ItemListJsonLdProps) {
  if (!products || products.length === 0) {
    return null;
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    ...(description ? { description } : {}),
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => {
      const loc = getProductLocalized(product, locale);
      const priceInfo = calculateProductPrice(product.price);
      const priceVal = priceInfo.price;
      const hasValidPrice = Number.isFinite(priceVal) && priceVal > 0;
      const inStock = product.price?.stock !== "OutOfStock";
      const canonicalUrl = `${baseUrl}/${locale}/products/${loc.slug}`;
      const globalPosition = (currentPage - 1) * pageSize + index + 1;

      // Never emit Product/Offer without a positive price — Google Search Console
      // flags missing "price" / "priceSpecification.price" inside offers as a critical error.
      if (!hasValidPrice) {
        return {
          "@type": "ListItem",
          position: globalPosition,
          name: loc.name,
          url: canonicalUrl,
        };
      }

      const imageUrl = resolveProductImageUrl(product.main_picture, {
        updatedAt: product.updated_at,
        baseUrl,
        fallbackUrl: `${baseUrl}/og-image.jpg`,
      });
      const validMpn = getValidMpn(product.product_sku);

      return {
        "@type": "ListItem",
        position: globalPosition,
        name: loc.name,
        url: canonicalUrl,
        item: {
          "@type": "Product",
          name: loc.name,
          url: canonicalUrl,
          image: imageUrl,
          ...(validMpn ? { sku: validMpn } : {}),
          brand: {
            "@type": "Brand",
            name: product.brand || "Sora",
          },
          offers: {
            "@type": "Offer",
            url: canonicalUrl,
            priceCurrency: "UZS",
            price: priceVal,
            availability: inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
          },
        },
      };
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
