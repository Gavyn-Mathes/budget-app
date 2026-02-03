// shared/domain/budget_report.ts
import type { BudgetLine } from "../types/budget_line";
import type { Transaction } from "../types/transaction";
import type { CategoryId } from "../types/category";
import { plannedAmountFromBudgetLine } from "./budget_line";
import { spentByCategory } from "./transaction";

export interface CategoryBudgetReport {
  categoryId: CategoryId;
  planned: number;
  spent: number;
  remaining: number;
}

export function buildCategoryBudgetReport(
  lines: BudgetLine[],
  transactions: Transaction[],
  percentBaseAmount: number // cap or last-month-income-total (your choice)
): CategoryBudgetReport[] {
  const spentMap = spentByCategory(transactions);

  return lines.map((line) => {
    const planned = plannedAmountFromBudgetLine(line as any, percentBaseAmount);
    const spent = spentMap[line.categoryId] ?? 0;
    return {
      categoryId: line.categoryId,
      planned,
      spent,
      remaining: Math.round((planned - spent) * 100) / 100,
    };
  });
}
