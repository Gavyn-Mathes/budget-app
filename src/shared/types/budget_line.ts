// shared/types/budget_line.ts
import type { Money, IsoTimestamp } from "./common";
import type { BudgetId } from "./budget";
import type { CategoryId } from "./category";

type BudgetLineBase = {
  budgetId: BudgetId;
  categoryId: CategoryId;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
};

export type BudgetLine =
  | (BudgetLineBase & {
      allocationType: "FIXED";
      fixedAmount: Money;
      percent: null;
    })
  | (BudgetLineBase & {
      allocationType: "PERCENT";
      fixedAmount: null;
      percent: number; // 0..1
    });
