// A monthly spending plan (cap) + a planned category breakdown (expenseSlices)
// + two distribution rulesets for moving money into Funds.
export type BudgetPlan = {
  id: string                      // UUID/ULID
  monthKey: string                // "YYYY-MM"
  currency: "USD"                 // currency code

  income: number                  // reference income for planning (e.g., last month's income)
  cap: number                     // planned monthly spending cap

  expenseSlices: CategoryPlan[]   // planned spending slices by category
  remainderDistribution: DistributionRule[] // splits remainder (cap - spent) into Funds
  surplusDistribution: DistributionRule[]   // splits surplus (income - cap) into Funds
}

// One planned spending slice for a single expense category.
export type CategoryPlan =
  | { id: string; categoryId: string; mode: "FIXED"; fixed: number } // planned fixed amount
  | { id: string; categoryId: string; mode: "PERCENT"; percent: number; base: "CAP" | "NET_CAP" } // percent of base (define base meaning)
  | { id: string; categoryId: string; mode: "MANUAL"; amount: number } // planned manual amount

// One distribution rule for allocating a pool of money into a Fund.
// percentage is 0..1 and rules should sum to 1.
export type DistributionRule = {
  id: string                      // UUID/ULID
  fundId: string                  // destination Fund.id
  percentage: number              // allocation fraction (0..1)
}
