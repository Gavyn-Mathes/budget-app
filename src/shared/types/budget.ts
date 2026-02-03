// shared/types/budget.ts
import type { Id, MonthKey, Money, IsoTimestamp } from "./common";

export type BudgetId = Id;

export interface Budget {
  budgetId: BudgetId;

  // Month this budget is for
  budgetMonthKey: MonthKey;

  // Month whose income baseline this budget uses
  incomeMonthKey: MonthKey;

  cap: Money;
  notes: string | null;

  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}
