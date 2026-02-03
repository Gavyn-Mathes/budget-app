// shared/schemas/transaction.ts
import { z } from "zod";
import { IdSchema, MoneySchema, IsoDateSchema, IsoTimestampSchema } from "./common";

export const TransactionSchema = z.object({
  transactionId: IdSchema,
  categoryId: IdSchema,
  date: IsoDateSchema,
  amount: MoneySchema.nonnegative(),
  notes: z.string().nullable(),

  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

export type TransactionDTO = z.infer<typeof TransactionSchema>;
