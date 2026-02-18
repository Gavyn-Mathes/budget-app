// shared/types/budget.ts
import type { BudgetDTO, BudgetUpsertInputDTO } from "../schemas/budget";

export type BudgetId = BudgetDTO["budgetId"];
export type Budget = BudgetDTO;
export type BudgetUpsertInput = BudgetUpsertInputDTO;
