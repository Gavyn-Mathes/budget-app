// main/db/mappers/budgets.mapper.ts
import type { Budget } from "../../../shared/types/budget";

export type DbBudgetRow = {
  budget_id: string;
  budget_month_key: string;
  income_month_key: string;
  cap: number;
  notes: string | null;
  surplus_handled: 0 | 1;
  leftovers_handled: 0 | 1;
  spending_fund_id: string | null;
  spending_asset_id: string | null;
  overage_fund_id: string | null;
  overage_asset_id: string | null;
  created_at: string;
  updated_at: string;
};

export function mapBudget(row: DbBudgetRow): Budget {
  return {
    budgetId: row.budget_id,
    budgetMonthKey: row.budget_month_key as Budget["budgetMonthKey"],
    incomeMonthKey: row.income_month_key as Budget["incomeMonthKey"],
    cap: row.cap,
    notes: row.notes,
    surplusHandled: row.surplus_handled === 1,
    leftoversHandled: row.leftovers_handled === 1,
    spendingFundId: row.spending_fund_id,
    spendingAssetId: row.spending_asset_id,
    overageFundId: row.overage_fund_id,
    overageAssetId: row.overage_asset_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
