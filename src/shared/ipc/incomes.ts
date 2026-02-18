// shared/ipc/incomes.ts
import { z } from "zod";
import { MonthKeySchema } from "../schemas/common";
import {
  IncomeMonthSchema,
  IncomeMonthUpsertInputSchema,
  IncomeSchema,
  IncomeUpsertInputSchema,
} from "../schemas/income";

export const INCOMES_IPC = {
  ListByMonth: "incomes:list-by-month",
  GetMonth: "incomes:get-month",
  UpsertMonth: "incomes:upsert-month",
  Upsert: "incomes:upsert",
  Delete: "incomes:delete",
} as const;

export const ListByMonthReq = z.object({ incomeMonthKey: MonthKeySchema });
export const ListByMonthRes = z.object({ incomes: z.array(IncomeSchema) });

export const GetMonthReq = z.object({ incomeMonthKey: MonthKeySchema });
export const GetMonthRes = z.object({ month: IncomeMonthSchema.nullable() });

export const UpsertMonthReq = z.object({ month: IncomeMonthUpsertInputSchema });
export const UpsertMonthRes = z.object({ ok: z.literal(true), month: IncomeMonthSchema });

export const UpsertReq = z.object({
  income: IncomeUpsertInputSchema,
  monthKey: MonthKeySchema.optional(),
});
export const UpsertRes = z.object({ ok: z.literal(true), income: IncomeSchema });

export const DeleteReq = z.object({ incomeId: z.string().min(1) });
export const DeleteRes = z.object({ ok: z.literal(true) });
