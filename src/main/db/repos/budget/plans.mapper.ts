import type { BudgetPlan } from "../../../../shared/domain/budget/types"

// DB row shape for budget_plans (snake_case, matches table columns)
export type BudgetPlanRow = {
  id: string
  month_key: string
  currency: "USD"
  income: number
  cap: number
  created_at: string
  updated_at: string
}

// Domain -> DB row (header only)
export function budgetPlanToRow(plan: BudgetPlan, nowIso: string): BudgetPlanRow {
  return {
    id: plan.id,
    month_key: plan.monthKey,
    currency: plan.currency,
    income: plan.income,
    cap: plan.cap,
    created_at: nowIso,
    updated_at: nowIso,
  }
}

// DB row -> Domain (header only; children added by repo)
export function rowToBudgetPlanHeader(row: BudgetPlanRow): Omit<
  BudgetPlan,
  "expenseSlices" | "remainderDistribution" | "surplusDistribution"
> {
  return {
    id: row.id,
    monthKey: row.month_key,
    currency: row.currency,
    income: row.income,
    cap: row.cap,
  }
}

// Compose full domain object (repo calls this after querying children)
export function composeBudgetPlan(
  header: Omit<BudgetPlan, "expenseSlices" | "remainderDistribution" | "surplusDistribution">,
  expenseSlices: BudgetPlan["expenseSlices"],
  remainderDistribution: BudgetPlan["remainderDistribution"],
  surplusDistribution: BudgetPlan["surplusDistribution"]
): BudgetPlan {
  return {
    ...header,
    expenseSlices,
    remainderDistribution,
    surplusDistribution,
  }
}
