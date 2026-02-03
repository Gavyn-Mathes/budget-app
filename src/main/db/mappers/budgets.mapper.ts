// main/db/mappers/budgets.mapper.ts
import type { Budget } from "../../../shared/types/budget";

export type DbBudgetRow = {
  budget_id: string;
  budget_month_key: string;
  income_month_key: string;
  cap: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export function mapBudget(row: DbBudgetRow): Budget {
  return {
    budgetId: row.budget_id,
    budgetMonthKey: row.budget_month_key as Budget["budgetMonthKey"],
    incomeMonthKey: row.income_month_key as Budget["incomeMonthKey"],
    cap: row.cap as any, // Money is typically a branded number type
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
