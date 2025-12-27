import { randomUUID } from "crypto"
import { getDb } from "../../index"
import type { DistributionRule } from "../../../../shared/domain/budget/types"
import { rowToRule, ruleToRow, type BudgetDistributionRow, type DistributionType } from "./distributions.mapper"

/**
 * List distribution rules by plan + type.
 */
export function listDistributions(budgetPlanId: string, type: DistributionType): DistributionRule[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT id, budget_plan_id, distribution_type, fund_id, percentage, created_at, updated_at
    FROM budget_distributions
    WHERE budget_plan_id = ? AND distribution_type = ?
    ORDER BY fund_id ASC
  `).all(budgetPlanId, type) as BudgetDistributionRow[]

  return rows.map(rowToRule)
}

/**
 * Create one distribution rule.
 * If caller didn't provide an id, we generate one.
 */
export function createDistribution(
  budgetPlanId: string,
  type: DistributionType,
  rule: Omit<DistributionRule, "id"> & { id?: string }
): DistributionRule {
  const db = getDb()
  const nowIso = new Date().toISOString()

  const withId: DistributionRule = { ...rule, id: rule.id ?? randomUUID() }
  const row = ruleToRow(withId, budgetPlanId, type, nowIso)

  db.prepare(`
    INSERT INTO budget_distributions (
      id, budget_plan_id, distribution_type, fund_id, percentage,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    row.id, row.budget_plan_id, row.distribution_type, row.fund_id, row.percentage,
    row.created_at, row.updated_at
  )

  return withId
}

/**
 * Update one rule by id.
 */
export function updateDistribution(
  budgetPlanId: string,
  type: DistributionType,
  rule: DistributionRule
): boolean {
  const db = getDb()
  const nowIso = new Date().toISOString()

  const row = ruleToRow(rule, budgetPlanId, type, nowIso)

  const res = db.prepare(`
    UPDATE budget_distributions
    SET fund_id = ?, percentage = ?, updated_at = ?
    WHERE id = ? AND budget_plan_id = ? AND distribution_type = ?
  `).run(
    row.fund_id,
    row.percentage,
    nowIso,
    row.id,
    budgetPlanId,
    type
  )

  return res.changes > 0
}

/**
 * Delete one rule by id.
 */
export function deleteDistribution(budgetPlanId: string, type: DistributionType, ruleId: string): boolean {
  const db = getDb()
  const res = db.prepare(`
    DELETE FROM budget_distributions
    WHERE id = ? AND budget_plan_id = ? AND distribution_type = ?
  `).run(ruleId, budgetPlanId, type)

  return res.changes > 0
}

/**
 * Replace all rules for a plan+type.
 */
export function replaceDistributions(
  budgetPlanId: string,
  type: DistributionType,
  rules: DistributionRule[]
): void {
  const db = getDb()
  const nowIso = new Date().toISOString()

  const del = db.prepare(`
    DELETE FROM budget_distributions
    WHERE budget_plan_id = ? AND distribution_type = ?
  `)

  const ins = db.prepare(`
    INSERT INTO budget_distributions (
      id, budget_plan_id, distribution_type, fund_id, percentage,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const tx = db.transaction(() => {
    del.run(budgetPlanId, type)

    for (const r of rules) {
      const rule: DistributionRule = r.id ? r : { ...(r as any), id: randomUUID() }
      const row = ruleToRow(rule, budgetPlanId, type, nowIso)

      ins.run(
        row.id, row.budget_plan_id, row.distribution_type, row.fund_id, row.percentage,
        row.created_at, row.updated_at
      )
    }
  })

  tx()
}
