// shared/schemas/budget.ts
import { z } from "zod";
import { IdSchema, MonthKeySchema, MoneySchema, IsoTimestampSchema } from "./common";

export const BudgetEditableSchema = z.object({
  budgetMonthKey: MonthKeySchema,
  incomeMonthKey: MonthKeySchema,
  cap: MoneySchema.nonnegative(),
  notes: z.string().nullable().optional().default(null),
  spendingFundId: IdSchema.nullable().optional().default(null),
  spendingAssetId: IdSchema.nullable().optional().default(null),
  overageFundId: IdSchema.nullable().optional().default(null),
  overageAssetId: IdSchema.nullable().optional().default(null),
});

export const BudgetSchema = BudgetEditableSchema.extend({
  budgetId: IdSchema,
  surplusHandled: z.boolean(),
  leftoversHandled: z.boolean(),
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

export const BudgetUpsertInputSchema = BudgetEditableSchema.extend({
  budgetId: IdSchema.optional(),
  surplusHandled: z.boolean().optional(),
  leftoversHandled: z.boolean().optional(),
}).superRefine((v, ctx) => {
  const overageFundId = String(v.overageFundId ?? "").trim();
  if (!overageFundId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "overageFundId is required",
      path: ["overageFundId"],
    });
  }
});

export type BudgetDTO = z.infer<typeof BudgetSchema>;
export type BudgetUpsertInputDTO = z.infer<typeof BudgetUpsertInputSchema>;
