// main/db/mappers/budget_lines.mapper.ts
import type { BudgetLine } from "../../../shared/types/budget_line";

export type DbBudgetLineRow = {
  budget_id: string;
  category_id: string;
  allocation_type: "FIXED" | "PERCENT";
  fixed_amount: number | null;
  percent: number | null;
  created_at: string;
  updated_at: string;
};

export function mapBudgetLine(row: DbBudgetLineRow): BudgetLine {
  const base = {
    budgetId: row.budget_id,
    categoryId: row.category_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as const;

  if (row.allocation_type === "FIXED") {
    if (row.fixed_amount === null || row.percent !== null) {
      throw new Error(
        `Invalid FIXED budget_line row for budget_id=${row.budget_id} category_id=${row.category_id}`
      );
    }
    return {
      ...base,
      allocationType: "FIXED",
      fixedAmount: row.fixed_amount as any, // Money is typically a branded number type
      percent: null,
    };
  }

  // PERCENT
  if (row.percent === null || row.fixed_amount !== null) {
    throw new Error(
      `Invalid PERCENT budget_line row for budget_id=${row.budget_id} category_id=${row.category_id}`
    );
  }

  return {
    ...base,
    allocationType: "PERCENT",
    fixedAmount: null,
    percent: row.percent,
  };
}
