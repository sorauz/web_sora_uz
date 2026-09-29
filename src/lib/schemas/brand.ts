import { z } from "zod";

export const BrandSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Brand = z.infer<typeof BrandSchema>;

export const ManufacturerSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Manufacturer = z.infer<typeof ManufacturerSchema>;

export const CountrySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Country = z.infer<typeof CountrySchema>;

export const BrandsResponseSchema = z.object({
  brands: z.array(BrandSchema).default([]),
  manufacturers: z.array(ManufacturerSchema).default([]),
  countries: z.array(CountrySchema).default([]),
});

export type BrandsResponse = z.infer<typeof BrandsResponseSchema>;
