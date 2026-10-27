"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, ExternalLink } from "lucide-react";
import { Product, getProductLocalized } from "@/lib/schemas/product";
import { calculateProductPrice } from "@/lib/utils/price";
import { reachGoal } from "@/lib/analytics/yandex";

interface ProductAiAssistantProps {
  product: Product;
  locale: "uz" | "ru";
  baseUrl?: string;
}

const TECH_KEYWORDS = [
  "texnika",
  "oborudovanie",
  "uskuna",
  "doska",
  "doski",
  "aksessuar",
  "aksessuary",
  "shreder",
  "seyf",
  "seif",
  "laminator",
  "pereplet",
  "pereplyot",
  "hisoblagich",
  "schetchik",
  "detektor",
  "printer",
  "skaner",
  "kalkulyator",
  "proektor",
  "termoprinter",
  "shtrix",
];

/**
 * Cleans quotes, newlines, and excessive length so the encoded URL remains compact and safe.
 */
function sanitizeForPrompt(input: string, maxLength = 100): string {
  if (!input) return "";
  const cleaned = input
    .replace(/["«»„“”]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 1).trim()}…`;
}

export function ProductAiAssistant({
  product,
  locale,
  baseUrl = "https://sora.uz",
}: ProductAiAssistantProps) {
  const [copiedInfo, setCopiedInfo] = useState<string | null>(null);

  const isUz = locale === "uz";
  const loc = getProductLocalized(product, locale);
  const priceInfo = calculateProductPrice(product.price);
  const priceVal = priceInfo.price;
  const inStock = product.price?.stock !== "OutOfStock";

  // Rule 0: Do not show AI analysis widget on out-of-stock products
  if (!inStock) {
    return null;
  }

  // Bilingual category & title check for office/trade equipment & technical items
  const searchCorpus = [
    product.uz?.category_slug_uz,
    product.ru?.category_slug_ru,
    product.uz?.category_uz,
    product.ru?.category_ru,
    product.uz?.name_uz,
    product.ru?.name_ru,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const isTechProduct = TECH_KEYWORDS.some((kw) => searchCorpus.includes(kw));

  // Extract valid 1C attributes
  const validAttributes = (product.attributes || [])
    .map((attr) => {
      const prop =
        (isUz ? attr.property_uz : attr.property_ru) ||
        attr.property_uz ||
        attr.property_ru;
      const val =
        (isUz ? attr.value_uz : attr.value_ru) ||
        attr.value_uz ||
        attr.value_ru;
      return {
        prop: prop?.trim() || "",
        val: val?.trim() || "",
      };
    })
    .filter((a) => Boolean(a.prop && a.val));

  // Rule 2: Smart Visibility Filter
  // Show only on:
  // 1) Products priced >= 300,000 UZS
  // 2) B2B / Negotiable equipment (price <= 0)
  // 3) Technical/equipment categories or items with >= 3 attributes (priced >= 100,000 UZS)
  const shouldShow =
    priceVal >= 300_000 ||
    priceVal <= 0 ||
    ((isTechProduct || validAttributes.length >= 3) && priceVal >= 100_000);

  if (!shouldShow) {
    return null;
  }

  // Rule 1: Clean Canonical URL (without UTM or session query params)
  const canonicalSlug =
    (isUz ? product.uz?.slug_uz : product.ru?.slug_ru) ||
    loc.slug ||
    product.id;
  const canonicalUrl = `${baseUrl}/${locale}/products/${canonicalSlug}`;

  // Format price string for prompt
  const formattedPrice =
    priceVal > 0
      ? isUz
        ? `narxi: ${priceVal.toLocaleString("ru-RU")} so'm`
        : `цена: ${priceVal.toLocaleString("ru-RU")} сум`
      : isUz
      ? "korporativ buyurtma asosida"
      : "под заказ";

  // 3-Stage Fallback for Short Specifications Summary
  const specParts: string[] = [];
  if (validAttributes.length > 0) {
    for (const attr of validAttributes.slice(0, 3)) {
      specParts.push(`${attr.prop}: ${attr.val}`);
    }
  } else {
    if (product.brand) {
      specParts.push(`${isUz ? "Brend" : "Бренд"}: ${product.brand}`);
    }
    if (product.country) {
      specParts.push(`${isUz ? "Mamlakat" : "Страна"}: ${product.country}`);
    }
    if (product.package) {
      specParts.push(`${isUz ? "Qadoq" : "Упаковка"}: ${product.package}`);
    }
  }

  const cleanName = sanitizeForPrompt(loc.name, 95);
  const cleanSpecs = sanitizeForPrompt(specParts.join(", "), 115);

  // Select Formula B (Technical) or Formula A (Universal Sales)
  const useTechnicalTemplate =
    (isTechProduct || validAttributes.length >= 2) && cleanSpecs.length > 0;

  const promptText = useTechnicalTemplate
    ? isUz
      ? `Sora.uz saytidagi "${cleanName}" (${cleanSpecs}, ${formattedPrice}) mahsulotining texnik ko'rsatkichlarini oddiy tilda tushuntirib ber: ${canonicalUrl} — Ushbu modelning kuchli tomonlari nimada va uni ofis yoki ish jarayonida ishlatishda nimalarga e'tibor berish kerak?`
      : `Объясни простым языком технические характеристики товара «${cleanName}» (${cleanSpecs}, ${formattedPrice}) из магазина Sora.uz: ${canonicalUrl} — В чем сильные стороны этой модели и на что обратить внимание при установке и эксплуатации?`
    : isUz
    ? `Sora.uz onlayn do'konidagi "${cleanName}" (${formattedPrice}) mahsulotini tahlil qilib ber: ${canonicalUrl} — Uning asosiy afzalliklari, sifat ko'rsatkichlari va aynan qanday vazifalar uchun eng yaxshi tanlov ekanligini qisqa punktlarda tushuntir.`
    : `Проанализируй товар «${cleanName}» (${formattedPrice}) в интернет-магазине Sora.uz на основе страницы: ${canonicalUrl} — Кратко выдели главные преимущества, ключевые характеристики и объясни, для каких задач эта модель подойдет лучше всего.`;

  const encodedPrompt = encodeURIComponent(promptText);

  // Show Claude as 4th option specifically for B2B / Tech / High-ticket items
  const showClaude = isTechProduct || priceVal >= 1_000_000 || priceVal <= 0;

  const providers = [
    {
      id: "chatgpt",
      label: "ChatGPT",
      href: `https://chatgpt.com/?q=${encodedPrompt}`,
      badgeClass:
        "hover:border-emerald-300 hover:bg-emerald-50/70 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40",
      dotClass: "bg-emerald-500",
    },
    {
      id: "google_ai",
      label: "Google AI",
      href: `https://www.google.com/search?udm=50&q=${encodedPrompt}`,
      badgeClass:
        "hover:border-blue-300 hover:bg-blue-50/70 dark:hover:border-blue-800 dark:hover:bg-blue-950/40",
      dotClass: "bg-blue-500",
    },
    {
      id: "perplexity",
      label: "Perplexity",
      href: `https://www.perplexity.ai/search?q=${encodedPrompt}`,
      badgeClass:
        "hover:border-teal-300 hover:bg-teal-50/70 dark:hover:border-teal-800 dark:hover:bg-teal-950/40",
      dotClass: "bg-teal-500",
    },
    ...(showClaude
      ? [
          {
            id: "claude",
            label: "Claude",
            href: `https://claude.ai/new?q=${encodedPrompt}`,
            badgeClass:
              "hover:border-amber-300 hover:bg-amber-50/70 dark:hover:border-amber-800 dark:hover:bg-amber-950/40",
            dotClass: "bg-amber-600",
          },
        ]
      : []),
  ];

  const copyPromptToClipboard = async (source: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(promptText);
        setCopiedInfo(source);
        setTimeout(() => setCopiedInfo(null), 3500);
      }
    } catch {
      // Clipboard API may be restricted in some webviews; silently ignore
    }
  };

  const handleProviderClick = (providerId: string) => {
    // Auto-copy prompt to clipboard as mobile/auth fallback
    void copyPromptToClipboard(providerId);

    // Rule 7: Yandex Metrika Goal Tracking
    reachGoal("ai_analyze_click", {
      ai_provider: providerId,
      product_id: product.id,
      product_sku: product.product_sku,
      product_name: loc.name,
      category: loc.category_slug,
      price: priceVal,
      template: useTechnicalTemplate ? "technical_b" : "universal_a",
      locale,
    });
  };

  const handleManualCopy = () => {
    void copyPromptToClipboard("manual");
    reachGoal("ai_prompt_copy", {
      product_id: product.id,
      product_sku: product.product_sku,
      price: priceVal,
      locale,
    });
  };

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-indigo-50/30 to-sky-50/30 dark:from-slate-900/80 dark:via-indigo-950/20 dark:to-slate-900/80 border border-indigo-100/80 dark:border-indigo-900/40 space-y-2.5">
      {/* Header / Micro-copy */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-snug">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-100/80 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <span>
            {isUz
              ? "Mahsulot sizga mos kelishiga ikkilanyapsizmi? AI-ekspertdan 5 soniyada qisqa tahlil oling:"
              : "Сомневаетесь, подойдет ли вам товар? Получите краткий разбор от ИИ-эксперта за 5 секунд:"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleManualCopy}
          title={
            isUz
              ? "Savol matnini buferga nusxalash"
              : "Скопировать текст запроса"
          }
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/80 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
        >
          {copiedInfo === "manual" ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-semibold">
                {isUz ? "Nusxalandi" : "Скопировано"}
              </span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isUz ? "Nusxa" : "Копия"}
              </span>
            </>
          )}
        </button>
      </div>

      {/* AI Provider Pill Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {providers.map((provider) => (
          <a
            key={provider.id}
            href={provider.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleProviderClick(provider.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700/80 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs transition-all active:scale-[0.98] ${provider.badgeClass}`}
          >
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${provider.dotClass}`}
            />
            <span>{provider.label}</span>
            <ExternalLink className="w-3 h-3 text-slate-400 dark:text-slate-500 ml-0.5" />
          </a>
        ))}
      </div>

      {/* Mobile / Auth Clipboard Fallback Helper Toast */}
      {copiedInfo && copiedInfo !== "manual" && (
        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1.5 pt-0.5 animate-fade-in">
          <Check className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
          <span>
            {isUz
              ? "Savol buferga ham nusxalandi — agar AI oynasida avtomatik chiqmasa, «Joylashtirish (Paste)» tugmasini bosing."
              : "Запрос также скопирован в буфер — если окно ИИ пустое, просто нажмите «Вставить (Paste)»."}
          </span>
        </p>
      )}
    </div>
  );
}
