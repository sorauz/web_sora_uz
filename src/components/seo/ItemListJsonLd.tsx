import { Product, getProductLocalized } from "@/lib/schemas/product";
import { calculateProductPrice } from "@/lib/utils/price";

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
      const inStock = product.price?.stock !== "OutOfStock";
      const canonicalUrl = `${baseUrl}/${locale}/products/${loc.slug}`;
      const imageUrl =
        product.main_picture && product.main_picture.trim() !== ""
          ? product.main_picture.startsWith("http")
            ? product.main_picture
            : `${baseUrl}${product.main_picture}`
          : `${baseUrl}/placeholder-product.svg`;

      const globalPosition = (currentPage - 1) * pageSize + index + 1;

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
          sku: product.product_sku,
          brand: {
            "@type": "Brand",
            name: product.brand,
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
