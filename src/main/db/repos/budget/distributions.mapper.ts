import type { DistributionRule } from "../../../../shared/domain/budget/types"

export type DistributionType = "REMAINDER" | "SURPLUS"

export type BudgetDistributionRow = {
  id: string
  budget_plan_id: string
  distribution_type: DistributionType
  fund_id: string
  percentage: number
  created_at: string
  updated_at: string
}

export function ruleToRow(
  rule: DistributionRule,
  budgetPlanId: string,
  type: DistributionType,
  nowIso: string
): BudgetDistributionRow {
  return {
    id: rule.id,
    budget_plan_id: budgetPlanId,
    distribution_type: type,
    fund_id: rule.fundId,
    percentage: rule.percentage,
    created_at: nowIso,
    updated_at: nowIso,
  }
}

export function rowToRule(row: BudgetDistributionRow): DistributionRule {
  return {
    id: row.id,
    fundId: row.fund_id,
    percentage: row.percentage,
  }
}
