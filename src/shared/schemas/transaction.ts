// shared/schemas/transaction.ts
import { z } from "zod";
import { IdSchema, MoneySchema, IsoDateSchema, IsoTimestampSchema } from "./common";

export const TransactionEditableSchema = z.object({
  categoryId: IdSchema,
  date: IsoDateSchema,
  amount: MoneySchema.nonnegative(),
  notes: z.string().nullable().optional().default(null),
});

export const TransactionSchema = TransactionEditableSchema.extend({
  transactionId: IdSchema,
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

export const TransactionUpsertInputSchema = TransactionEditableSchema.extend({
  transactionId: IdSchema.optional(),
});

export type TransactionDTO = z.infer<typeof TransactionSchema>;
export type TransactionUpsertInputDTO = z.infer<typeof TransactionUpsertInputSchema>;
