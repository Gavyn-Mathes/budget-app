// shared/ipc/budgets.ts
import { z } from "zod";
import { IdSchema, MonthKeySchema } from "../schemas/common";
import { BudgetSchema, BudgetUpsertInputSchema } from "../schemas/budget";

export const BUDGETS_IPC = {
  GetByMonth: "budgets:get-by-month",
  Upsert: "budgets:upsert",
  List: "budgets:list",
  CopyToNextMonth: "budgets:copy-to-next-month",
  ApplyDistributions: "budgets:apply-distributions",
  UndoDistributions: "budgets:undo-distributions",
  TransferIncomeToSpending: "budgets:transfer-income-to-spending",
} as const;

export const GetByMonthReq = z.object({ budgetMonthKey: MonthKeySchema });
export const GetByMonthRes = z.object({ budget: BudgetSchema.nullable() });

export const UpsertReq = z.object({ budget: BudgetUpsertInputSchema });
export const UpsertRes = z.object({ ok: z.literal(true), budget: BudgetSchema });

export const ListReq = z.object({});
export const ListRes = z.object({ budgets: z.array(BudgetSchema) });

export const CopyToNextMonthReq = z.object({ budgetMonthKey: MonthKeySchema });
export const CopyToNextMonthRes = z.object({ ok: z.literal(true), budget: BudgetSchema });

export const ApplyDistributionsReq = z.object({
  budgetMonthKey: MonthKeySchema,
  mode: z.enum(["SURPLUS", "LEFTOVERS", "ALL"]).optional().default("ALL"),
  force: z.boolean().optional().default(false),
});
export const ApplyDistributionsRes = z.object({
  ok: z.literal(true),
  budget: BudgetSchema,
  createdEventIds: z.array(IdSchema),
});

export const UndoDistributionsReq = z.object({
  budgetMonthKey: MonthKeySchema,
  mode: z.enum(["SURPLUS", "LEFTOVERS", "ALL"]).optional().default("ALL"),
});

export const UndoDistributionsRes = z.object({
  ok: z.literal(true),
  budget: BudgetSchema,
  deletedEventIds: z.array(IdSchema),
});

export const TransferIncomeToSpendingReq = z.object({
  budgetMonthKey: MonthKeySchema,
  incomeFundId: IdSchema.nullable().optional().default(null),
  incomeAssetId: IdSchema.nullable().optional().default(null),
  amountMinor: z.number().int().positive().nullable().optional().default(null),
});

export const TransferIncomeToSpendingRes = z.object({
  ok: z.literal(true),
  budget: BudgetSchema,
  eventId: IdSchema,
  amountMinor: z.number().int().positive(),
  sourceAssetId: IdSchema,
  destinationAssetId: IdSchema,
});
