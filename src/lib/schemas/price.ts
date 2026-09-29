import { z } from "zod";

export const ProductPriceStockSchema = z.object({
  id: z.string(),
  stock: z.string().default("InStock"),
  quantity_remaining: z.number().default(0),
  unit_ru: z.string().default("шт"),
  unit_uz: z.string().default("dona"),
  retail_price: z.number().default(0),
  dealer_price: z.number().default(0),
  wholesale_price: z.number().default(0),
  currency: z.string().default("UZS"),
});

export type ProductPriceStock = z.infer<typeof ProductPriceStockSchema>;

export const PricesResponseSchema = z.object({
  updated_at: z.string(),
  products: z.array(ProductPriceStockSchema),
});

export type PricesResponse = z.infer<typeof PricesResponseSchema>;
