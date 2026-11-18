import type { ResolvedFaqItem } from "@/lib/utils/faq-resolver";

interface FaqJsonLdProps {
  items: ResolvedFaqItem[];
}

/**
 * Sahifadagi ko'rinadigan yakuniy savol-javoblar ro'yxati asosida
 * bitta yagona schema.org/FAQPage JSON-LD mikrobelgilashini generatsiya qiladi.
 */
export function FaqJsonLd({ items }: FaqJsonLdProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.paragraphs.join("\n\n"),
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
