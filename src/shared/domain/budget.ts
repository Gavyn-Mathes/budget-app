// shared/domain/budget.ts
import type { Budget } from "../types/budget";
import type { MonthKey } from "../types/common";
import { prevMonthKey } from "./month";

export function expectedIncomeMonthForBudget(budgetMonthKey: MonthKey): MonthKey {
  return prevMonthKey(budgetMonthKey);
}

export function budgetIncomeLinkIsValid(budget: Pick<Budget, "budgetMonthKey" | "incomeMonthKey">): boolean {
  return budget.incomeMonthKey === expectedIncomeMonthForBudget(budget.budgetMonthKey);
}
