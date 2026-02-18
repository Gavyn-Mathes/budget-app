// shared/types/budget_line.ts
import type { BudgetLineDTO, BudgetLineUpsertInputDTO } from "../schemas/budget_line";

export type BudgetLine = BudgetLineDTO;
export type BudgetLineUpsertInput = BudgetLineUpsertInputDTO;
export type CategoryId = BudgetLineDTO["categoryId"];
export type BudgetId = BudgetLineDTO["budgetId"];
