// shared/ipc/budget_lines.ts
import { z } from "zod";
import { IdSchema } from "../schemas/common";
import { BudgetLineSchema } from "../schemas/budget_line";

export const BUDGET_LINES_IPC = {
  ListByBudget: "budget-lines:list-by-budget",
  UpsertMany: "budget-lines:upsert-many",
  DeleteOne: "budget-lines:delete-one",
} as const;

export const ListByBudgetReq = z.object({
  budgetId: IdSchema,
});
export const ListByBudgetRes = z.object({
  lines: z.array(BudgetLineSchema),
});

export const UpsertManyReq = z.object({
  budgetId: IdSchema,
  lines: z.array(BudgetLineSchema),
});
export const UpsertManyRes = z.object({
  ok: z.literal(true),
});

export const DeleteOneReq = z.object({
  budgetId: IdSchema,
  categoryId: IdSchema,
});
export const DeleteOneRes = z.object({
  ok: z.literal(true),
});
