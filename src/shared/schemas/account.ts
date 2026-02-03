// shared/schemas/account.ts
import { z } from "zod";
import { IdSchema, CurrencyCodeSchema, IsoTimestampSchema } from "./common";

export const AccountSchema = z.object({
  accountId: IdSchema,
  name: z.string().min(1),

  accountTypeId: IdSchema,

  defaultCurrencyCode: CurrencyCodeSchema,

  description: z.string().nullable(),
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

export type AccountDTO = z.infer<typeof AccountSchema>;
