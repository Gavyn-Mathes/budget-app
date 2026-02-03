// shared/domain/transactions.ts
import type { Transaction } from "../types/transaction";
import type { CategoryId } from "../types/category";

export function spentByCategory(transactions: Transaction[]): Record<CategoryId, number> {
  const totals: Record<string, number> = {};
  for (const t of transactions) {
    totals[t.categoryId] = (totals[t.categoryId] ?? 0) + t.amount;
  }
  // optional: round to cents
  for (const k of Object.keys(totals)) totals[k] = Math.round(totals[k] * 100) / 100;
  return totals as Record<CategoryId, number>;
}
