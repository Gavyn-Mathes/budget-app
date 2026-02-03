// shared/ipc/distributions.ts
import { z } from "zod";
import { IdSchema } from "../schemas/common";
import { DistributionRuleSchema } from "../schemas/distribution";

export const DISTRIBUTIONS_IPC = {
  ListByBudget: "distributions:list-by-budget",
  UpsertMany: "distributions:upsert-many",
  DeleteOne: "distributions:delete-one",
} as const;

export const ListByBudgetReq = z.object({ budgetId: IdSchema });
export const ListByBudgetRes = z.object({ rules: z.array(DistributionRuleSchema) });

export const UpsertManyReq = z.object({
  budgetId: IdSchema,
  rules: z.array(DistributionRuleSchema),
});
export const UpsertManyRes = z.object({ ok: z.literal(true) });

export const DeleteOneReq = z.object({ distributionRuleId: IdSchema });
export const DeleteOneRes = z.object({ ok: z.literal(true) });
