// main/db/repos/budget/plans.repo.ts
import { randomUUID } from "crypto"
import { getDb } from "../../index"
import type { BudgetPlan, CategoryPlan, DistributionRule } from "../../../../shared/domain/budget/types"
import type { BudgetDistributionRow } from "./distributions.mapper"

type DistType = "REMAINDER" | "SURPLUS"

type BudgetPlanRow = {
  id: string
  month_key: string
  currency: "USD"
  income: number
  cap: number
  created_at: string
  updated_at: string
}

type SliceRow = {
  id: string
  category_id: string
  mode: "FIXED" | "PERCENT" | "MANUAL"
  fixed: number | null
  percent: number | null
  base: "CAP" | "NET_CAP" | null
  amount: number | null
}

function normalizeSliceNumbers(s: CategoryPlan): {
  fixed: number | null
  percent: number | null
  base: "CAP" | "NET_CAP" | null
  amount: number | null
} {
  return {
    fixed: s.mode === "FIXED" ? s.fixed : null,
    percent: s.mode === "PERCENT" ? s.percent : null,
    base: s.mode === "PERCENT" ? s.base : null,
    amount: s.mode === "MANUAL" ? s.amount : null,
  }
}

function ensureId(id: string | undefined): string {
  return id && id.length > 0 ? id : randomUUID()
}

/**
 * Creates a new BudgetPlan in the DB (and all children) and returns the created plan.
 * This is a "create" API: it generates a new plan id and expects monthKey to be unique.
 */
export function createBudgetPlan(input: Omit<BudgetPlan, "id">): BudgetPlan {
  const db = getDb()
  const nowIso = new Date().toISOString()

  const plan: BudgetPlan = { ...input, id: randomUUID() }

  const insertPlan = db.prepare(`
    INSERT INTO budget_plans (id, month_key, currency, income, cap, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const insertSlice = db.prepare(`
    INSERT INTO budget_expense_slices (
      id, budget_plan_id, category_id, mode,
      fixed, percent, base, amount,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertDist = db.prepare(`
    INSERT INTO budget_distributions (
      id, budget_plan_id, distribution_type, fund_id, percentage,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const tx = db.transaction(() => {
    insertPlan.run(plan.id, plan.monthKey, plan.currency, plan.income, plan.cap, nowIso, nowIso)

    for (const s of plan.expenseSlices) {
      const sliceId = ensureId(s.id)
      const { fixed, percent, base, amount } = normalizeSliceNumbers(s)

      insertSlice.run(
        sliceId,
        plan.id,
        s.categoryId,
        s.mode,
        fixed,
        percent,
        base,
        amount,
        nowIso,
        nowIso
      )
    }

    const writeDists = (type: DistType, rules: DistributionRule[]) => {
      for (const r of rules) {
        const ruleId = ensureId(r.id)
        insertDist.run(ruleId, plan.id, type, r.fundId, r.percentage, nowIso, nowIso)
      }
    }

    writeDists("REMAINDER", plan.remainderDistribution)
    writeDists("SURPLUS", plan.surplusDistribution)
  })

  tx()
  return plan
}

/**
 * Upserts a BudgetPlan for a month.
 * - If a plan exists for monthKey, it updates the header and replaces slices/distributions.
 * - If it does not exist, it creates it.
 *
 * Returns a plan whose id matches the DB row for that monthKey.
 */
export function saveBudgetPlan(plan: BudgetPlan): BudgetPlan {
  const db = getDb()
  const nowIso = new Date().toISOString()

  const upsertPlan = db.prepare(`
    INSERT INTO budget_plans (id, month_key, currency, income, cap, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(month_key) DO UPDATE SET
      currency   = excluded.currency,
      income     = excluded.income,
      cap        = excluded.cap,
      updated_at = excluded.updated_at
  `)

  const getPlanId = db.prepare(`SELECT id FROM budget_plans WHERE month_key = ?`)

  const delSlices = db.prepare(`DELETE FROM budget_expense_slices WHERE budget_plan_id = ?`)
  const delDists = db.prepare(`DELETE FROM budget_distributions WHERE budget_plan_id = ?`)

  const insertSlice = db.prepare(`
    INSERT INTO budget_expense_slices (
      id, budget_plan_id, category_id, mode,
      fixed, percent, base, amount,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertDist = db.prepare(`
    INSERT INTO budget_distributions (
      id, budget_plan_id, distribution_type, fund_id, percentage,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  let planId = plan.id && plan.id.length > 0 ? plan.id : randomUUID()

  const tx = db.transaction(() => {
    upsertPlan.run(planId, plan.monthKey, plan.currency, plan.income, plan.cap, nowIso, nowIso)

    const row = getPlanId.get(plan.monthKey) as { id: string } | undefined
    if (!row) throw new Error("failed to load budget plan id after upsert")

    planId = row.id

    // Replace children
    delSlices.run(planId)
    delDists.run(planId)

    for (const s of plan.expenseSlices) {
      const sliceId = ensureId(s.id)
      const { fixed, percent, base, amount } = normalizeSliceNumbers(s)

      insertSlice.run(
        sliceId,
        planId,
        s.categoryId,
        s.mode,
        fixed,
        percent,
        base,
        amount,
        nowIso,
        nowIso
      )
    }

    const writeDists = (type: DistType, rules: DistributionRule[]) => {
      for (const r of rules) {
        const ruleId = ensureId(r.id)
        insertDist.run(ruleId, planId, type, r.fundId, r.percentage, nowIso, nowIso)
      }
    }

    writeDists("REMAINDER", plan.remainderDistribution)
    writeDists("SURPLUS", plan.surplusDistribution)
  })

  tx()

  // IMPORTANT: return the real DB id for that monthKey
  return { ...plan, id: planId }
}

function rowToSlice(r: SliceRow): CategoryPlan {
  if (r.mode === "FIXED") {
    if (r.fixed == null) throw new Error("invalid slice row: FIXED missing fixed")
    return { id: r.id, categoryId: r.category_id, mode: "FIXED", fixed: r.fixed }
  }
  if (r.mode === "PERCENT") {
    if (r.percent == null || r.base == null) throw new Error("invalid slice row: PERCENT missing percent/base")
    return {
      id: r.id,
      categoryId: r.category_id,
      mode: "PERCENT",
      percent: r.percent,
      base: r.base,
    }
  }
  // MANUAL
  if (r.amount == null) throw new Error("invalid slice row: MANUAL missing amount")
  return { id: r.id, categoryId: r.category_id, mode: "MANUAL", amount: r.amount }
}

function rowsToRules(rows: BudgetDistributionRow[]): DistributionRule[] {
  return rows.map(r => ({ id: r.id, fundId: r.fund_id, percentage: r.percentage }))
}

/**
 * Loads the full BudgetPlan for a given monthKey ("YYYY-MM"), including:
 *  - expenseSlices
 *  - remainderDistribution
 *  - surplusDistribution
 *
 * Returns null if no plan exists for that month.
 */
export function getBudgetPlan(monthKey: string): BudgetPlan | null {
  const db = getDb()

  const planRow = db.prepare(`
    SELECT id, month_key, currency, income, cap, created_at, updated_at
    FROM budget_plans
    WHERE month_key = ?
  `).get(monthKey) as BudgetPlanRow | undefined

  if (!planRow) return null
  const planId = planRow.id

  const sliceRows = db.prepare(`
    SELECT id, category_id, mode, fixed, percent, base, amount
    FROM budget_expense_slices
    WHERE budget_plan_id = ?
    ORDER BY category_id ASC
  `).all(planId) as SliceRow[]

  const expenseSlices = sliceRows.map(rowToSlice)

  const distRows = db.prepare(`
    SELECT id, fund_id, percentage
    FROM budget_distributions
    WHERE budget_plan_id = ? AND distribution_type = ?
    ORDER BY fund_id ASC
  `)

  const remainderRows = distRows.all(planId, "REMAINDER" satisfies DistType) as BudgetDistributionRow[]
  const surplusRows = distRows.all(planId, "SURPLUS" satisfies DistType) as BudgetDistributionRow[]

  return {
    id: planRow.id,
    monthKey: planRow.month_key,
    currency: planRow.currency,
    income: planRow.income,
    cap: planRow.cap,
    expenseSlices,
    remainderDistribution: rowsToRules(remainderRows),
    surplusDistribution: rowsToRules(surplusRows),
  }
}
