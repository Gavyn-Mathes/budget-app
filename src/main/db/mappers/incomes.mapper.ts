// main/db/mappers/income.mapper.ts
import type { Income } from "../../../shared/types/income";

export type DbIncomeRow = {
  income_id: string;
  income_month_key: string;
  name: string;
  date: string; // YYYY-MM-DD (or longer ISO)
  amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export function mapIncome(row: DbIncomeRow): Income {
  return {
    incomeId: row.income_id,
    incomeMonthKey: row.income_month_key as Income["incomeMonthKey"],
    name: row.name,
    date: row.date as Income["date"],
    amount: row.amount as any, // Money branded number
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
