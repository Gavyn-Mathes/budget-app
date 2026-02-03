// shared/schemas/fund.ts
import { z } from "zod";
import { IdSchema, IsoTimestampSchema } from "./common";

export const FundSchema = z.object({
  fundId: IdSchema,
  name: z.string().min(1),
  description: z.string().nullable(),
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

export type FundDTO = z.infer<typeof FundSchema>;
