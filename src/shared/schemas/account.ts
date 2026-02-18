// shared/schemas/account.ts
import { z } from "zod";
import { IdSchema, CurrencyCodeSchema, IsoTimestampSchema } from "./common";

/**
 * UI-editable fields only.
 */
export const AccountEditableSchema = z.object({
  name: z.string().min(1),
  accountTypeId: IdSchema,
  defaultCurrencyCode: CurrencyCodeSchema,

  // allow omission in requests; normalize missing -> null
  description: z.string().nullable().optional().default(null),
});

/**
 * Canonical stored record (returned from main / stored in DB).
 */
export const AccountSchema = AccountEditableSchema.extend({
  accountId: IdSchema,
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

export const AccountWithTotalsSchema = AccountSchema.extend({
  assetsMinor: z.number(),
  liabilitiesMinor: z.number(),
  netMinor: z.number(),
});

/**
 * Upsert input: insert if no id, update if id present.
 * No timestamps allowed from UI.
 */
export const AccountUpsertInputSchema = AccountEditableSchema.extend({
  accountId: IdSchema.optional(),
});

export type AccountDTO = z.infer<typeof AccountSchema>;
export type AccountUpsertInputDTO = z.infer<typeof AccountUpsertInputSchema>;
export type AccountWithTotalsDTO = z.infer<typeof AccountWithTotalsSchema>;
