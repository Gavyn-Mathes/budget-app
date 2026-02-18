// shared/schemas/income.ts
import { z } from "zod";
import {
  IdSchema,
  MonthKeySchema,
  IsoDateSchema,
  MoneySchema,
  IsoTimestampSchema,
} from "./common";

export const IncomeMonthSchema = z.object({
  incomeMonthKey: MonthKeySchema,
  incomeFundId: IdSchema.nullable(),
  incomeAssetId: IdSchema.nullable(),
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

export const IncomeMonthUpsertInputSchema = z.object({
  incomeMonthKey: MonthKeySchema,
  incomeFundId: IdSchema.nullable().optional().default(null),
  incomeAssetId: IdSchema.nullable().optional().default(null),
});

/**
 * Editable fields only (what a form can send).
 */
export const IncomeEditableSchema = z.object({
  incomeMonthKey: MonthKeySchema,
  name: z.string().min(1),
  date: IsoDateSchema,

  // SQL enforces amount >= 0
  amount: MoneySchema.nonnegative(),

  // Allow omission in requests; normalize missing -> null
  notes: z.string().nullable().optional().default(null),
});

/**
 * Canonical record (what main returns / what DB stores).
 */
export const IncomeSchema = IncomeEditableSchema.extend({
  incomeId: IdSchema,
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

/**
 * IPC input for upsert:
 * - incomeId optional (missing => insert)
 * - no createdAt/updatedAt (repo owns timestamps)
 */
export const IncomeUpsertInputSchema = IncomeEditableSchema.extend({
  incomeId: IdSchema.optional(),
});

export type IncomeMonthDTO = z.infer<typeof IncomeMonthSchema>;
export type IncomeMonthUpsertInputDTO = z.infer<typeof IncomeMonthUpsertInputSchema>;
export type IncomeEditableDTO = z.infer<typeof IncomeEditableSchema>;
export type IncomeDTO = z.infer<typeof IncomeSchema>;
export type IncomeUpsertInputDTO = z.infer<typeof IncomeUpsertInputSchema>;
