import { z } from "zod";

export const UnitSchema = z.object({
  id: z.string(),
  name: z.string(),
  unit_uz: z.string(),
  unit_ru: z.string(),
});

export type Unit = z.infer<typeof UnitSchema>;

export const UnitsResponseSchema = z.object({
  units: z.array(UnitSchema),
});

export type UnitsResponse = z.infer<typeof UnitsResponseSchema>;
