// shared/schemas/budget_line.ts
import { z } from "zod";
import { IdSchema, MoneySchema, IsoTimestampSchema } from "./common";

const StoredBase = z.object({
  budgetId: IdSchema,
  categoryId: IdSchema,
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

const UpsertBase = z.object({
  budgetId: IdSchema,
  categoryId: IdSchema,
});

export const BudgetLineSchema = z.discriminatedUnion("allocationType", [
  StoredBase.extend({
    allocationType: z.literal("FIXED"),
    fixedAmount: MoneySchema.nonnegative(),
    percent: z.null(),
  }),
  StoredBase.extend({
    allocationType: z.literal("PERCENT"),
    fixedAmount: z.null(),
    percent: z.number().min(0).max(1),
  }),
]);

export const BudgetLineUpsertInputSchema = z.discriminatedUnion("allocationType", [
  UpsertBase.extend({
    allocationType: z.literal("FIXED"),
    fixedAmount: MoneySchema.nonnegative(),
    percent: z.null(),
  }),
  UpsertBase.extend({
    allocationType: z.literal("PERCENT"),
    fixedAmount: z.null(),
    percent: z.number().min(0).max(1),
  }),
]);

export type BudgetLineDTO = z.infer<typeof BudgetLineSchema>;
export type BudgetLineUpsertInputDTO = z.infer<typeof BudgetLineUpsertInputSchema>;
