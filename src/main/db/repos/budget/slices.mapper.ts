import type { CategoryPlan } from "../../../../shared/domain/budget/types"

export type BudgetSliceRow = {
  id: string
  budget_plan_id: string
  category_id: string
  mode: "FIXED" | "PERCENT" | "MANUAL"
  fixed: number | null
  percent: number | null
  base: "CAP" | "NET_CAP" | null
  amount: number | null
  created_at: string
  updated_at: string
}

export function sliceToRow(
  slice: CategoryPlan,
  budgetPlanId: string,
  nowIso: string
): BudgetSliceRow {
  const common = {
    id: slice.id,
    budget_plan_id: budgetPlanId,
    category_id: slice.categoryId,
    mode: slice.mode,
    created_at: nowIso,
    updated_at: nowIso,
  }

  if (slice.mode === "FIXED") {
    return { ...common, fixed: slice.fixed, percent: null, base: null, amount: null }
  }

  if (slice.mode === "PERCENT") {
    return { ...common, fixed: null, percent: slice.percent, base: slice.base, amount: null }
  }

  // MANUAL
  return { ...common, fixed: null, percent: null, base: null, amount: slice.amount }
}

export function rowToSlice(row: BudgetSliceRow): CategoryPlan {
  if (row.mode === "FIXED") {
    if (row.fixed == null) throw new Error("invalid slice row: FIXED missing fixed")
    return { id: row.id, categoryId: row.category_id, mode: "FIXED", fixed: row.fixed }
  }

  if (row.mode === "PERCENT") {
    if (row.percent == null || row.base == null) throw new Error("invalid slice row: PERCENT missing percent/base")
    return {
      id: row.id,
      categoryId: row.category_id,
      mode: "PERCENT",
      percent: row.percent,
      base: row.base,
    }
  }

  // MANUAL
  if (row.amount == null) throw new Error("invalid slice row: MANUAL missing amount")
  return { id: row.id, categoryId: row.category_id, mode: "MANUAL", amount: row.amount }
}
