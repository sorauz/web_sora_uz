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
          telephone: "+998-90-326-47-57",
          contactType: "customer service",
          areaServed: "UZ",
          availableLanguage: ["Uzbek", "Russian"],
        },
        sameAs: [
          "https://t.me/sorauz",
          "https://t.me/sora_uz",
          "https://www.instagram.com/sorauz/",
        ],
      },
      {
        "@type": ["LocalBusiness", "Store"],
        "@id": "https://sora.uz/#store",
        name: "Sora.uz — Kanselyariya va ofis mollari do'koni",
        url: "https://sora.uz",
        telephone: "+998-90-326-47-57",
        image: "https://sora.uz/icon.png",
        priceRange: "$$",
        parentOrganization: {
          "@id": "https://sora.uz/#organization",
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: "Olmazor tumani, Dilsaroy ko'chasi, 1-uy",
          addressLocality: "Toshkent",
          addressRegion: "Toshkent shahri",
          postalCode: "100000",
          addressCountry: "UZ",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 41.2858,
          longitude: 69.2558,
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ],
            opens: "09:00",
            closes: "19:00",
          },
        ],
        sameAs: [
          "https://t.me/sorauz",
          "https://t.me/sora_uz",
          "https://www.instagram.com/sorauz/",
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
