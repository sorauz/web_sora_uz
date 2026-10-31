import { Category } from "../schemas/category";
import { getCategoryBreadcrumb } from "../utils/category-tree";

export interface CategoryOgConfig {
  id: string;
  oneCId?: string;
  slugs: string[];
  titleUz: string;
  titleRu: string;
  imageFileName: string;
  altUz: string;
  altRu: string;
}

/**
 * 1-darajali (Root) kategoriyalar uchun Open Graph (og:image) reyestri.
 * Hozirda 9 ta kategoriya rasmi faol. Qolgan 3 tasi tayyor bo'lgach shu ro'yxatga qo'shiladi.
 */
export const ROOT_CATEGORY_OG_MAP: CategoryOgConfig[] = [
  {
    id: "qogoz",
    oneCId: "fedb5849-aade-11f1-a5cd-00155d78c303",
    slugs: [
      "qogoz-mahsulotlari",
      "bumazhnaya-produktsiya",
      "bumazhnaya-produkciya",
      "bumaga-i-bloknoty",
    ],
    titleUz: "Qogʻoz mahsulotlari",
    titleRu: "Бумажная продукция",
    imageFileName: "qogoz-mahsulotlari.jpg",
    altUz: "Qog'oz mahsulotlari — Sora.uz internet do'koni",
    altRu: "Бумажная продукция — интернет-магазин Sora.uz",
  },
  {
    id: "ofis",
    oneCId: "b6b54651-ac3c-11f1-a5ce-00155d78c303",
    slugs: [
      "ofis-buyumlari",
      "ofisnye-prinadlezhnosti",
      "ofis-jihozlari-va-kanselyariya",
      "ofisnaya-tekhnika-i-kancelyariya",
    ],
    titleUz: "Ofis buyumlari",
    titleRu: "Офисные принадлежности",
    imageFileName: "ofis-buyumlari.jpg",
    altUz: "Ofis buyumlari va jihozlari — Sora.uz internet do'koni",
    altRu: "Офисные принадлежности и техника — интернет-магазин Sora.uz",
  },
  {
    id: "yozuv",
    oneCId: "166b1992-acd0-11f1-a5ce-00155d78c303",
    slugs: [
      "yozuv-qurollari",
      "pismennye-prinadlezhnosti",
    ],
    titleUz: "Yozuv qurollari",
    titleRu: "Письменные принадлежности",
    imageFileName: "yozuv-qurollari.jpg",
    altUz: "Yozuv qurollari (ruchkalar, markerlar, qalamlar) — Sora.uz",
    altRu: "Письменные принадлежности (ручки, маркеры, карандаши) — Sora.uz",
  },
  {
    id: "papkalar",
    oneCId: "2b86bb70-acef-11f1-a5ce-00155d78c303",
    slugs: [
      "papkalar-va-fayllar",
      "papki-i-fajly",
    ],
    titleUz: "Papkalar va fayllar",
    titleRu: "Папки и файлы",
    imageFileName: "papkalar-va-fayllar.jpg",
    altUz: "Papkalar, fayllar va registratorlar — Sora.uz internet do'koni",
    altRu: "Папки, файлы и регистраторы — интернет-магазин Sora.uz",
  },
  {
    id: "doskalar",
    oneCId: "114816ab-acef-11f1-a5ce-00155d78c303",
    slugs: [
      "namoyish-doskalari",
      "demonstracionnye-doski",
    ],
    titleUz: "Namoyish doskalari",
    titleRu: "Демонстрационные доски",
    imageFileName: "namoyish-doskalari.jpg",
    altUz: "Namoyish va magnit doskalari, flipchartlar — Sora.uz",
    altRu: "Демонстрационные и магнитные доски, флипчарты — Sora.uz",
  },
  {
    id: "maktab",
    oneCId: "81569d12-acef-11f1-a5ce-00155d78c303",
    slugs: [
      "maktab-va-oqish-uchun",
      "tovary-dlya-shkoly",
    ],
    titleUz: "Maktab va o‘qish uchun tovarlar",
    titleRu: "Товары для школы",
    imageFileName: "maktab-va-oqish-uchun.jpg",
    altUz: "Maktab va o'qish uchun tovarlar — Sora.uz internet do'koni",
    altRu: "Товары для школы и творчества — интернет-магазин Sora.uz",
  },
  {
    id: "chizmachilik",
    oneCId: "96d08e2f-acef-11f1-a5ce-00155d78c303",
    slugs: [
      "chizmachilik-qurollari",
      "chertezhnye-prinadlezhnosti",
    ],
    titleUz: "Chizmachilik qurollari",
    titleRu: "Чертежные принадлежности",
    imageFileName: "chizmachilik-qurollari.jpg",
    altUz: "Chizmachilik qurollari va anjomlari — Sora.uz internet do'koni",
    altRu: "Чертежные принадлежности и инструменты — интернет-магазин Sora.uz",
  },
  {
    id: "muhrlar",
    oneCId: "acb36662-acef-11f1-a5ce-00155d78c303",
    slugs: [
      "muhr-va-shtamplar",
      "pechati-i-shtampy",
    ],
    titleUz: "Muhr va shtamplar",
    titleRu: "Печати и штампы",
    imageFileName: "muhr-va-shtamplar.jpg",
    altUz: "Muhr va shtamplar, daterlar — Sora.uz internet do'koni",
    altRu: "Печати и штампы, датеры — интернет-магазин Sora.uz",
  },
  {
    id: "savdo",
    oneCId: "ef1aac74-acef-11f1-a5ce-00155d78c303",
    slugs: [
      "savdo-uchun-uskunalar",
      "oborudovanie-dlya-torgovli",
    ],
    titleUz: "Savdo va ofis uskunalari",
    titleRu: "Оборудование для торговли",
    imageFileName: "savdo-uchun-uskunalar.jpg",
    altUz: "Savdo va ofis uskunalari (kalkulyatorlar, laminatorlar, hisoblagichlar) — Sora.uz",
    altRu: "Оборудование для торговли и офиса (калькуляторы, ламинаторы, счетчики) — Sora.uz",
  },
];

/**
 * Berilgan kategoriya (yoki uning yuqori ota kategoriyasi) uchun mos Open Graph rasmini qaytaradi.
 */
export function getCategoryOgImage(
  category: {
    id?: string;
    group_slug_uz?: string;
    group_slug_ru?: string;
    group_uz?: string;
    group_ru?: string;
  } | null | undefined,
  allCategories?: Category[],
  locale: "uz" | "ru" = "uz"
): {
  url: string;
  width: number;
  height: number;
  alt: string;
  type: string;
} {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sora.uz";
  const defaultFallback = {
    url: `${baseUrl}/og-image.jpg`,
    width: 1200,
    height: 630,
    alt:
      locale === "uz"
        ? "Sora.uz — Kanselyariya va ofis mollari internet do'koni"
        : "Sora.uz — Интернет-магазин канцелярских и офисных товаров",
    type: "image/jpeg",
  };

  if (!category) return defaultFallback;

  // 1. To'g'ridan-to'g'ri joriy kategoriya bo'yicha qidirish
  const directMatch = ROOT_CATEGORY_OG_MAP.find(
    (cfg) =>
      (category.id && cfg.oneCId === category.id) ||
      (category.group_slug_uz && cfg.slugs.includes(category.group_slug_uz)) ||
      (category.group_slug_ru && cfg.slugs.includes(category.group_slug_ru))
  );

  if (directMatch) {
    return {
      url: `${baseUrl}/og/categories/${directMatch.imageFileName}`,
      width: 1200,
      height: 630,
      alt: locale === "uz" ? directMatch.altUz : directMatch.altRu,
      type: "image/jpeg",
    };
  }

  // 2. Agar ichki kategoriya (bola) bo'lsa, uning asosiy ota kategoriyasidan meros olish
  if (allCategories && category.id) {
    const breadcrumb = getCategoryBreadcrumb(allCategories, category.id);
    for (const ancestor of breadcrumb) {
      const ancestorMatch = ROOT_CATEGORY_OG_MAP.find(
        (cfg) =>
          (ancestor.id && cfg.oneCId === ancestor.id) ||
          (ancestor.group_slug_uz && cfg.slugs.includes(ancestor.group_slug_uz)) ||
          (ancestor.group_slug_ru && cfg.slugs.includes(ancestor.group_slug_ru))
      );
      if (ancestorMatch) {
        return {
          url: `${baseUrl}/og/categories/${ancestorMatch.imageFileName}`,
          width: 1200,
          height: 630,
          alt: locale === "uz" ? ancestorMatch.altUz : ancestorMatch.altRu,
          type: "image/jpeg",
        };
      }
    }
  }

  return defaultFallback;
}
