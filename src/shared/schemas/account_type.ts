// shared/schemas/account_type.ts
import { z } from "zod";
import { IdSchema, IsoTimestampSchema } from "./common";

export const AccountTypeEditableSchema = z.object({
  accountType: z.string().min(1),
});

export const AccountTypeSchema = AccountTypeEditableSchema.extend({
  accountTypeId: IdSchema,
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

/**
 * Upsert input: insert if no id, update if id present.
 * No timestamps allowed from UI.
 */
export const AccountTypeUpsertInputSchema = AccountTypeEditableSchema.extend({
  accountTypeId: IdSchema.optional(),
});

export type AccountTypeDTO = z.infer<typeof AccountTypeSchema>;
export type AccountTypeUpsertInputDTO = z.infer<typeof AccountTypeUpsertInputSchema>;
