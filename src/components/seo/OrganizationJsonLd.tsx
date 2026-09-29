export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://sora.uz/#organization",
        name: "Sora.uz",
        url: "https://sora.uz",
        logo: "https://sora.uz/icon.png",
        description:
          "Sora.uz — O'zbekistondagi eng yirik kanselyariya, maktab qurollari va ofis anjomlari internet do'koni.",
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+998-71-200-00-00",
          contactType: "customer service",
          areaServed: "UZ",
          availableLanguage: ["Uzbek", "Russian"],
        },
        sameAs: [
          "https://t.me/sora_uz",
          "https://instagram.com/sora_uz",
          "https://facebook.com/sora_uz",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://sora.uz/#website",
        url: "https://sora.uz",
        name: "Sora.uz",
        publisher: {
          "@id": "https://sora.uz/#organization",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://sora.uz/uz/search?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
