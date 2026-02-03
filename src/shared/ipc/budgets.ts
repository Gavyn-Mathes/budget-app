// shared/ipc/budgets.ts
import { z } from "zod";
import { MonthKeySchema } from "../schemas/common";
import { BudgetSchema } from "../schemas/budget";

export const BUDGETS_IPC = {
  GetByMonth: "budgets:get-by-month",
  Upsert: "budgets:upsert",
} as const;

export const GetByMonthReq = z.object({ budgetMonthKey: MonthKeySchema });
export const GetByMonthRes = z.object({ budget: BudgetSchema.nullable() });

export const UpsertReq = z.object({ budget: BudgetSchema });
export const UpsertRes = z.object({ ok: z.literal(true) });
