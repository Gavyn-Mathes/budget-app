// shared/ipc/incomes.ts
import { z } from "zod";
import { MonthKeySchema } from "../schemas/common";
import { IncomeSchema } from "../schemas/income";

export const INCOMES_IPC = {
  ListByMonth: "incomes:list-by-month",
  Upsert: "incomes:upsert",
  Delete: "incomes:delete",
} as const;

export const ListByMonthReq = z.object({ incomeMonthKey: MonthKeySchema });
export const ListByMonthRes = z.object({ incomes: z.array(IncomeSchema) });

export const UpsertReq = z.object({ income: IncomeSchema });
export const UpsertRes = z.object({ ok: z.literal(true) });

export const DeleteReq = z.object({ incomeId: z.string().min(1) });
export const DeleteRes = z.object({ ok: z.literal(true) });
