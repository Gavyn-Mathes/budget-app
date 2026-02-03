// shared/schemas/budget_line.ts
import { z } from "zod";
import { IdSchema, MoneySchema, IsoTimestampSchema } from "./common";

const BudgetLineBase = z.object({
  budgetId: IdSchema,
  categoryId: IdSchema,
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

export const BudgetLineSchema = z.discriminatedUnion("allocationType", [
  BudgetLineBase.extend({
    allocationType: z.literal("FIXED"),
    fixedAmount: MoneySchema.nonnegative(),
    percent: z.null(),
  }),
  BudgetLineBase.extend({
    allocationType: z.literal("PERCENT"),
    fixedAmount: z.null(),
    percent: z.number().min(0).max(1),
  }),
]);

export type BudgetLineDTO = z.infer<typeof BudgetLineSchema>;
