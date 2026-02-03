// shared/schemas/income.ts
import { z } from "zod";
import { IdSchema, MonthKeySchema,IsoDateSchema, MoneySchema, IsoTimestampSchema,} from "./common";

export const IncomeMonthSchema = z.object({
  incomeMonthKey: MonthKeySchema,
});

export const IncomeSchema = z.object({
  incomeId: IdSchema,
  incomeMonthKey: MonthKeySchema,
  name: z.string().min(1),
  date: IsoDateSchema,

  // SQL enforces amount >= 0
  amount: MoneySchema.nonnegative(),

  notes: z.string().nullable(),

  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

export type IncomeMonthDTO = z.infer<typeof IncomeMonthSchema>;
export type IncomeDTO = z.infer<typeof IncomeSchema>;
