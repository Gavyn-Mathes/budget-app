import { toMonthKey } from "../../utils/dates"
import type { FundEntry } from "../fund"
import type { BudgetPlan } from "./types"

type Money = number
export type PieSlice = { label: string; value: number }

export function computeSpentByCategory(plan: BudgetPlan, entries: FundEntry[]) {
  const spentByCategoryId = new Map<string, Money>()
  let totalSpent = 0

  for (const e of entries) {
    if (toMonthKey(e.date) !== plan.monthKey) continue
    if (e.kind !== "EXPENSE") continue

    const spent = Math.max(-e.amount, 0) // assumes expenses are negative
    spentByCategoryId.set(e.categoryId, (spentByCategoryId.get(e.categoryId) ?? 0) + spent)
    totalSpent += spent
  }

  return { spentByCategoryId, totalSpent }
}

/**
 * Build a pie chart of spending:
 *  - planned categories (by categoryId)
 *  - "Other" for unplanned categories
 *  - "Unused" or "Overspent" vs cap
 *
 * Pass categoryNameById to label slices nicely.
 */
export function buildCurrentPie(
  plan: BudgetPlan,
  entries: FundEntry[],
  categoryNameById: Map<string, string>
): PieSlice[] {
  const { spentByCategoryId, totalSpent } = computeSpentByCategory(plan, entries)
  const slices: PieSlice[] = []

  // Sum spending in planned categories
  let plannedSpent = 0
  for (const b of plan.expenseSlices) {
    const spent = spentByCategoryId.get(b.categoryId) ?? 0
    plannedSpent += spent

    if (spent > 0) {
      slices.push({
        label: categoryNameById.get(b.categoryId) ?? "Unknown Category",
        value: spent,
      })
    }
  }

  // Spending in categories not listed in the plan
  const otherSpent = Math.max(totalSpent - plannedSpent, 0)
  if (otherSpent > 0) slices.push({ label: "Other", value: otherSpent })

  // Unused remainder (or overspent)
  const remainder = plan.cap - totalSpent
  if (remainder > 0) slices.push({ label: "Unused", value: remainder })
  if (remainder < 0) slices.push({ label: "Overspent", value: -remainder })

  return slices
}
