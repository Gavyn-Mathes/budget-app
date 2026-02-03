// shared/domain/budget_line.ts
import type { BudgetLine } from "../types/budget_line";

export function plannedAmountFromBudgetLine(line: BudgetLine, baseAmount: number): number {
  if (!Number.isFinite(baseAmount)) return 0;

  if (line.allocationType === "FIXED") {
    return roundCents(line.fixedAmount);
  }

  // PERCENT
  return roundCents(line.percent * baseAmount);
}

export function roundCents(n: number): number {
  return Math.round(n * 100) / 100;
}

export function isBudgetLineValid(line: BudgetLine): boolean {
  if (line.allocationType === "FIXED") {
    return line.fixedAmount >= 0 && line.percent === null;
  }
  return line.percent >= 0 && line.percent <= 1 && line.fixedAmount === null;
}
