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

export type BudgetAllocationPlan = {
  spendablePoolMinor: number;
  fixedTotalMinor: number;
  percentBaseMinor: number;
  plannedByCategory: Map<string, number>;
  plannedTotalMinor: number;
  remainingMinor: number;
  overAllocated: boolean;
};

export function computeBudgetAllocationPlan(
  lines: Array<Pick<BudgetLine, "categoryId" | "allocationType" | "fixedAmount" | "percent">>,
  totalIncomeMinor: number,
  capMinor: number
): BudgetAllocationPlan {
  const income = Number(totalIncomeMinor ?? 0);
  const cap = Number(capMinor ?? 0);
  // Allocation pool is:
  // - cap when cap > 0
  // - full income when cap == 0
  const spendablePoolMinor =
    Math.round(cap) > 0 ? Math.max(0, Math.round(cap)) : Math.max(0, Math.round(income));

  let fixedTotalMinor = 0;
  for (const line of lines) {
    if (line.allocationType !== "FIXED") continue;
    fixedTotalMinor += Math.max(0, Math.round(Number(line.fixedAmount ?? 0)));
  }

  const percentBaseMinor = Math.max(0, spendablePoolMinor - fixedTotalMinor);

  const plannedByCategory = new Map<string, number>();
  for (const line of lines) {
    if (line.allocationType === "FIXED") {
      plannedByCategory.set(
        line.categoryId,
        Math.max(0, Math.round(Number(line.fixedAmount ?? 0)))
      );
      continue;
    }

    const percent = Number(line.percent ?? 0);
    const planned = Number.isFinite(percent)
      ? Math.max(0, Math.round(percent * percentBaseMinor))
      : 0;
    plannedByCategory.set(line.categoryId, planned);
  }

  let plannedTotalMinor = 0;
  for (const value of plannedByCategory.values()) {
    plannedTotalMinor += value;
  }

  const remainingMinor = spendablePoolMinor - plannedTotalMinor;
  return {
    spendablePoolMinor,
    fixedTotalMinor,
    percentBaseMinor,
    plannedByCategory,
    plannedTotalMinor,
    remainingMinor,
    overAllocated: plannedTotalMinor > spendablePoolMinor,
  };
}
