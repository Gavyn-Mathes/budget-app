// shared/types/income.ts
import type { Id, MonthKey, IsoDate, IsoTimestamp, Money } from "./common";

export type IncomeId = Id;

export interface IncomeMonth {
  incomeMonthKey: MonthKey; // "YYYY-MM"
}

export interface Income {
  incomeId: IncomeId;
  incomeMonthKey: MonthKey; // FK -> income_month.income_month_key
  name: string;
  date: IsoDate;
  amount: Money;            // >= 0
  notes: string | null;

  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}
