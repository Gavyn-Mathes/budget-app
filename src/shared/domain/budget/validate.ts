// shared/budget/validate.ts
import { toMonthNumber } from "../../utils/dates"
import type { BudgetPlan, CategoryPlan, DistributionRule } from "./types"

const EPS = 1e-6

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n)
}

function isValiddate(monthKey: string): boolean {
  // "YYYY-MM"
  if (!/^\d{4}-\d{2}$/.test(monthKey)) return false
  const mm = Number(toMonthNumber(monthKey))
  return mm >= 1 && mm <= 12
}

function approxEqual(a: number, b: number, eps = EPS): boolean {
  return Math.abs(a - b) <= eps
}

function validateCategoryPlan(plan: CategoryPlan, idx: number): string[] {
  const errors: string[] = []
  const where = `expenseSlices[${idx}]`

  if (!plan.id) errors.push(`${where}.id is required`)
  if (!plan.category) errors.push(`${where}.category is required`)

  if (plan.mode === "FIXED") {
    if (!isFiniteNumber(plan.fixed)) errors.push(`${where}.fixed must be a number`)
    else if (plan.fixed < 0) errors.push(`${where}.fixed must be >= 0`)
  } else if (plan.mode === "MANUAL") {
    if (!isFiniteNumber(plan.amount)) errors.push(`${where}.amount must be a number`)
    else if (plan.amount < 0) errors.push(`${where}.amount must be >= 0`)
  } else if (plan.mode === "PERCENT") {
    if (!isFiniteNumber(plan.percent)) errors.push(`${where}.percent must be a number`)
    else if (plan.percent < 0 || plan.percent > 1) errors.push(`${where}.percent must be in [0..1]`)
    if (plan.base !== "CAP" && plan.base !== "NET_CAP") {
      errors.push(`${where}.base must be "CAP" or "NET_CAP"`)
    }
  } else {
    // Exhaustiveness safety (in case mode expands)
    errors.push(`${where}.mode is invalid`)
  }

  return errors
}

function validateRemainderRule(rule: DistributionRule, idx: number): string[] {
  const errors: string[] = []
  const where = `remainderDistribution[${idx}]`

  if (!rule.id) errors.push(`${where}.id is required`)
  if (!rule.fundId) errors.push(`${where}.fundId is required`)

  if (!isFiniteNumber(rule.percentage)) errors.push(`${where}.percentage must be a number`)
  else if (rule.percentage < 0 || rule.percentage > 1) errors.push(`${where}.percentage must be in [0..1]`)

  return errors
}

/**
 * Validates structural + business constraints of a BudgetPlan.
 * Returns a list of human-readable errors. Empty array means "valid".
 */
export function validateBudgetPlan(plan: BudgetPlan): string[] {
  const errors: string[] = []

  if (!plan.id) errors.push("id is required")
  if (!plan.monthKey) errors.push("date is required")
  else if (!isValiddate(plan.monthKey)) errors.push('monthKey must be "YYYY-MM" with a valid month (01-12)')

  if (!plan.currency) errors.push("currency is required")
  else if (plan.currency !== "USD") errors.push('currency must be "USD"')

  // expenseSlices validation
  if (!Array.isArray(plan.expenseSlices)) {
    errors.push("expenseSlices must be an array")
  } else {
    // Optional: require at least one slice
    // if (plan.expenseSlices.length === 0) errors.push("expenseSlices must not be empty")

    const seenCategories = new Set<string>()
    const seenIds = new Set<string>()

    plan.expenseSlices.forEach((slice, i) => {
      errors.push(...validateCategoryPlan(slice, i))

      if (slice.id) {
        if (seenIds.has(slice.id)) errors.push(`expenseSlices has duplicate id "${slice.id}"`)
        seenIds.add(slice.id)
      }

      // prevent duplicate categories (common expectation for a pie plan)
      const cat = String(slice.category)
      if (seenCategories.has(cat)) errors.push(`expenseSlices has duplicate category "${cat}"`)
      seenCategories.add(cat)
    })
  }

  // remainderDistribution validation
  if (!Array.isArray(plan.remainderDistribution)) {
    errors.push("remainderDistribution must be an array")
  } else {
    const seenFunds = new Set<string>()
    const seenIds = new Set<string>()
    let sum = 0

    plan.remainderDistribution.forEach((rule, i) => {
      errors.push(...validateRemainderRule(rule, i))

      if (rule.id) {
        if (seenIds.has(rule.id)) errors.push(`remainderDistribution has duplicate id "${rule.id}"`)
        seenIds.add(rule.id)
      }

      if (rule.fundId) {
        if (seenFunds.has(rule.fundId)) errors.push(`remainderDistribution has duplicate fundId "${rule.fundId}"`)
        seenFunds.add(rule.fundId)
      }

      if (isFiniteNumber(rule.percentage)) sum += rule.percentage
    })

    // If rules exist, require they sum to 1 (100%) within tolerance
    if (plan.remainderDistribution.length > 0 && !approxEqual(sum, 1)) {
      errors.push(`remainderDistribution percentages must sum to 1 (got ${sum})`)
    }
  }

  return errors
}
