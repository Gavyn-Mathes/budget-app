// src/main/services/budget_lines.service.ts

import type Database from "better-sqlite3";
import type { BudgetLine, BudgetLineUpsertInput } from "../../shared/types/budget_line";
import { computeBudgetAllocationPlan } from "../../shared/domain/budget_line";
import { withTx } from "./common";
import { BudgetLinesRepo } from "../db/repos/budget_lines.repo";
import { BudgetsRepo } from "../db/repos/budgets.repo";
import { IncomeRepo } from "../db/repos/incomes.repo";

export class BudgetLinesService {
  constructor(
    private readonly db: Database.Database,
    private readonly repo: BudgetLinesRepo,
    private readonly budgetsRepo: BudgetsRepo,
    private readonly incomesRepo: IncomeRepo
  ) {}

  listByBudget(budgetId: string): BudgetLine[] {
    return this.repo.listByBudget(budgetId);
  }

  upsertMany(req: { budgetId: string; lines: BudgetLineUpsertInput[] }): void {
    return withTx(this.db, () => {
      const budget = this.budgetsRepo.getById(req.budgetId);
      if (!budget) {
        throw new Error(`Budget not found: ${req.budgetId}`);
      }

      const currentLines = this.repo.listByBudget(req.budgetId);
      const mergedByCategory = new Map<string, BudgetLine | BudgetLineUpsertInput>();
      for (const line of currentLines) mergedByCategory.set(line.categoryId, line);
      for (const line of req.lines) mergedByCategory.set(line.categoryId, line);
      const mergedLines = [...mergedByCategory.values()].map((line) => ({
        categoryId: line.categoryId,
        allocationType: line.allocationType,
        fixedAmount: line.fixedAmount,
        percent: line.percent,
      }));

      const incomes = this.incomesRepo.listByMonth(budget.incomeMonthKey);
      let totalIncomeMinor = 0;
      for (const income of incomes) totalIncomeMinor += Number(income.amount ?? 0);

      // Every FIXED line must fit within the "left to allocate" amount
      // after removing that line from the plan.
      for (const line of mergedLines) {
        if (line.allocationType !== "FIXED") continue;
        const fixedAmountMinor = Math.max(0, Math.round(Number(line.fixedAmount ?? 0)));
        const linesWithoutCurrent = mergedLines.filter(
          (candidate) => candidate.categoryId !== line.categoryId
        );
        const withoutCurrentPlan = computeBudgetAllocationPlan(
          linesWithoutCurrent,
          totalIncomeMinor,
          budget.cap
        );
        if (fixedAmountMinor > withoutCurrentPlan.remainingMinor) {
          const overBy = fixedAmountMinor - withoutCurrentPlan.remainingMinor;
          throw new Error(
            `Fixed allocation for category ${line.categoryId} exceeds left to allocate by ${overBy} minor units.`
          );
        }
      }

      const plan = computeBudgetAllocationPlan(
        mergedLines,
        totalIncomeMinor,
        budget.cap
      );
      const totalPercent = mergedLines
        .filter((line) => line.allocationType === "PERCENT")
        .reduce((sum, line) => sum + Number(line.percent ?? 0), 0);
      if (totalPercent > 1 + 1e-9) {
        throw new Error("Category allocation percentages exceed 100% of remaining pool.");
      }

      if (plan.overAllocated) {
        const overBy = Math.abs(plan.remainingMinor);
        throw new Error(
          `Category allocations exceed the available allocation pool by ${overBy} minor units.`
        );
      }

      this.repo.upsertMany(req.budgetId, req.lines);
    });
  }

  deleteOne(req: { budgetId: string; categoryId: string }): void {
    return withTx(this.db, () => this.repo.deleteOne(req.budgetId, req.categoryId));
  }
}
