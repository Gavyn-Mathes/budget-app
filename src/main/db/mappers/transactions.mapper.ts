// main/db/mappers/transactions.mapper.ts
import type { Transaction } from "../../../shared/types/transaction";

export type DbTransactionRow = {
  transaction_id: string;
  category_id: string;
  fund_event_id: string | null;
  date: string; // YYYY-MM-DD (or longer ISO)
  amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export function mapTransaction(row: DbTransactionRow): Transaction {
  return {
    transactionId: row.transaction_id,
    categoryId: row.category_id,
    date: row.date as Transaction["date"],
    amount: row.amount,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
