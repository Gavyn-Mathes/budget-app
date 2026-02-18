// shared/ipc/transactions.ts
import { z } from "zod";
import { IdSchema, MonthKeySchema } from "../schemas/common";
import { TransactionSchema, TransactionUpsertInputSchema } from "../schemas/transaction";

export const TRANSACTIONS_IPC = {
  ListByMonth: "transactions:list-by-month",
  Upsert: "transactions:upsert",
  Delete: "transactions:delete",
} as const;

export const ListByMonthReq = z.object({
  monthKey: MonthKeySchema,
});
export const ListByMonthRes = z.object({
  transactions: z.array(TransactionSchema),
});

export const UpsertReq = z.object({
  transaction: TransactionUpsertInputSchema,
  monthKey: MonthKeySchema.optional(),
});
export const UpsertRes = z.object({ ok: z.literal(true), transaction: TransactionSchema });

export const DeleteReq = z.object({ transactionId: IdSchema });
export const DeleteRes = z.object({ ok: z.literal(true) });
