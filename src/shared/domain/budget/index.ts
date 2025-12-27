// shared/budget/index.ts

// Runtime exports (if you add constants/compute functions later, export them here)
export { validateBudgetPlan } from "./validate"
export { buildCurrentPie, computeSpentByCategory } from "./compute"

// Type exports
export type { BudgetPlan, CategoryPlan, DistributionRule } from "./types"
