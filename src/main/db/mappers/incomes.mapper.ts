// main/db/mappers/income.mapper.ts
import type { Income, IncomeMonth } from "../../../shared/types/income";

export type DbIncomeRow = {
  income_id: string;
  income_month_key: string;
  fund_event_id: string | null;
  name: string;
  date: string; // YYYY-MM-DD (or longer ISO)
  amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DbIncomeMonthRow = {
  income_month_key: string;
  income_fund_id: string | null;
  income_asset_id: string | null;
  created_at: string;
  updated_at: string;
};

export function mapIncome(row: DbIncomeRow): Income {
  return {
    incomeId: row.income_id,
    incomeMonthKey: row.income_month_key as Income["incomeMonthKey"],
    name: row.name,
    date: row.date as Income["date"],
    amount: row.amount,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapIncomeMonth(row: DbIncomeMonthRow): IncomeMonth {
  return {
    incomeMonthKey: row.income_month_key as IncomeMonth["incomeMonthKey"],
    incomeFundId: row.income_fund_id,
    incomeAssetId: row.income_asset_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
