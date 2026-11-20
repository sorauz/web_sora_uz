export interface CatalogProductSummary {
  id: string;
  sku: string;
  name_uz: string;
  name_ru: string;
  slug_uz: string;
  slug_ru: string;
  picture: string;
  price?: number;
  unit_uz: string;
  unit_ru: string;
}

export type CatalogProductMap = Record<string, CatalogProductSummary>;
