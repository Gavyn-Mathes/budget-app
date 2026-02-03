// shared/ipc/transactions.ts
import { z } from "zod";
import { IdSchema, MonthKeySchema } from "../schemas/common";
import { TransactionSchema } from "../schemas/transaction";

export const TRANSACTIONS_IPC = {
  ListByMonth: "transactions:list-by-month",
  Upsert: "transactions:upsert",
  Delete: "transactions:delete",
} as const;

/**
 * Listing by month is common since budgets are monthly.
 * Main process can query by date range for that month.
 */
export const ListByMonthReq = z.object({
  monthKey: MonthKeySchema, // "YYYY-MM"
});
export const ListByMonthRes = z.object({
  transactions: z.array(TransactionSchema),
});

export const UpsertReq = z.object({ transaction: TransactionSchema });
export const UpsertRes = z.object({ ok: z.literal(true) });

export const DeleteReq = z.object({ transactionId: IdSchema });
export const DeleteRes = z.object({ ok: z.literal(true) });
