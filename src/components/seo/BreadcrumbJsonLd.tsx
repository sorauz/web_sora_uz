interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
  locale?: string;
}

export function BreadcrumbJsonLd({ items, locale = "uz" }: BreadcrumbJsonLdProps) {
  const baseUrl = "https://sora.uz";

  const allItems: BreadcrumbItem[] = [
    {
      name: locale === "uz" ? "Bosh sahifa" : "Главная",
      href: `/${locale}`,
    },
    ...items,
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.href.startsWith("http") ? item.href : `${baseUrl}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
