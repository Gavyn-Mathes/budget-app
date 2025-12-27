import { randomUUID } from "crypto"
import { getDb } from "../../index"
import type { CategoryPlan } from "../../../../shared/domain/budget/types"
import { rowToSlice, sliceToRow, type BudgetSliceRow } from "./slices.mapper"

/**
 * List all slices for a given budget plan (ordered by category_id for stability).
 */
export function listSlicesByPlan(budgetPlanId: string): CategoryPlan[] {
  const db = getDb()
  const rows = db.prepare(`
    SELECT id, budget_plan_id, category_id, mode, fixed, percent, base, amount, created_at, updated_at
    FROM budget_expense_slices
    WHERE budget_plan_id = ?
    ORDER BY category_id ASC
  `).all(budgetPlanId) as BudgetSliceRow[]

  return rows.map(rowToSlice)
}

/**
 * Insert one slice.
 * If caller didn't provide an id, we generate one.
 */
export function createSlice(budgetPlanId: string, slice: Omit<CategoryPlan, "id"> & { id?: string }): CategoryPlan {
  const db = getDb()
  const nowIso = new Date().toISOString()

  const withId: CategoryPlan = { ...(slice as any), id: slice.id ?? randomUUID() }
  const row = sliceToRow(withId, budgetPlanId, nowIso)

  db.prepare(`
    INSERT INTO budget_expense_slices (
      id, budget_plan_id, category_id, mode,
      fixed, percent, base, amount,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    row.id, row.budget_plan_id, row.category_id, row.mode,
    row.fixed, row.percent, row.base, row.amount,
    row.created_at, row.updated_at
  )

  return withId
}

/**
 * Update one slice by id.
 * (We don't allow changing budget_plan_id or created_at.)
 */
export function updateSlice(budgetPlanId: string, slice: CategoryPlan): boolean {
  const db = getDb()
  const nowIso = new Date().toISOString()

  const row = sliceToRow(slice, budgetPlanId, nowIso)

  const res = db.prepare(`
    UPDATE budget_expense_slices
    SET
      category_id = ?,
      mode = ?,
      fixed = ?,
      percent = ?,
      base = ?,
      amount = ?,
      updated_at = ?
    WHERE id = ? AND budget_plan_id = ?
  `).run(
    row.category_id,
    row.mode,
    row.fixed,
    row.percent,
    row.base,
    row.amount,
    nowIso,
    row.id,
    budgetPlanId
  )

  return res.changes > 0
}

/**
 * Delete one slice by id.
 */
export function deleteSlice(budgetPlanId: string, sliceId: string): boolean {
  const db = getDb()
  const res = db.prepare(`
    DELETE FROM budget_expense_slices
    WHERE id = ? AND budget_plan_id = ?
  `).run(sliceId, budgetPlanId)

  return res.changes > 0
}

/**
 * Replace all slices for a plan (common for "edit budget" flows).
 * Transaction-safe: you won't end up with half-replaced slices.
 */
export function replaceSlicesForPlan(budgetPlanId: string, slices: CategoryPlan[]): void {
  const db = getDb()
  const nowIso = new Date().toISOString()

  const del = db.prepare(`DELETE FROM budget_expense_slices WHERE budget_plan_id = ?`)
  const ins = db.prepare(`
    INSERT INTO budget_expense_slices (
      id, budget_plan_id, category_id, mode,
      fixed, percent, base, amount,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const tx = db.transaction(() => {
    del.run(budgetPlanId)
    for (const s of slices) {
      const slice: CategoryPlan = s
      const row = sliceToRow(slice, budgetPlanId, nowIso)

      ins.run(
        row.id, row.budget_plan_id, row.category_id, row.mode,
        row.fixed, row.percent, row.base, row.amount,
        row.created_at, row.updated_at
      )
    }
  })

  tx()
}
