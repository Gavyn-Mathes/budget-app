// shared/types/transaction.ts
import type { Id, Money, IsoDate, IsoTimestamp } from "./common";
import type { CategoryId } from "./category";

export type TransactionId = Id;

export interface Transaction {
  transactionId: TransactionId;
  categoryId: CategoryId;
  date: IsoDate;           // "YYYY-MM-DD"
  amount: Money;           // >= 0
  notes: string | null;

  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}
