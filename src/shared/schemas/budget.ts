// shared/schemas/budget.ts
import { z } from "zod";
import { IdSchema, MonthKeySchema, MoneySchema, IsoTimestampSchema } from "./common";

export const BudgetSchema = z.object({
  budgetId: IdSchema,
  budgetMonthKey: MonthKeySchema,
  incomeMonthKey: MonthKeySchema,
  cap: MoneySchema.nonnegative(),
  notes: z.string().nullable(),

  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

export type BudgetDTO = z.infer<typeof BudgetSchema>;
