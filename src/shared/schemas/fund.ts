// shared/schemas/fund.ts
import { z } from "zod";
import { IdSchema, IsoTimestampSchema } from "./common";

export const FundEditableSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional().default(null),
});

export const FundSchema = FundEditableSchema.extend({
  fundId: IdSchema,
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

export const FundWithTotalsSchema = FundSchema.extend({
  assetsMinor: z.number(),
  liabilitiesMinor: z.number(),
  netMinor: z.number(),
});

export const FundUpsertInputSchema = FundEditableSchema.extend({
  fundId: IdSchema.optional(),
});

export type FundDTO = z.infer<typeof FundSchema>;
export type FundUpsertInputDTO = z.infer<typeof FundUpsertInputSchema>;
export type FundWithTotalsDTO = z.infer<typeof FundWithTotalsSchema>;