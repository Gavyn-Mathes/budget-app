// shared/schemas/distribution.ts
import { z } from "zod";
import { IdSchema, MoneySchema, IsoTimestampSchema } from "./common";
import { DISTRIBUTION_SOURCE_TYPE } from "../constants/distribution";

const Base = z.object({
  distributionRuleId: IdSchema,
  budgetId: IdSchema,

  sourceType: z.enum([DISTRIBUTION_SOURCE_TYPE[0], DISTRIBUTION_SOURCE_TYPE[1]]),
  categoryId: IdSchema.nullable(),
  fundId: IdSchema,

  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

const Fixed = Base.extend({
  allocationType: z.literal("FIXED"),
  fixedAmount: MoneySchema.nonnegative(),
  percent: z.null(),
});

const Percent = Base.extend({
  allocationType: z.literal("PERCENT"),
  fixedAmount: z.null(),
  percent: z.number().min(0).max(1),
});

export const DistributionRuleSchema = z
  .discriminatedUnion("allocationType", [Fixed, Percent])
  .superRefine((v, ctx) => {
    if (v.sourceType === DISTRIBUTION_SOURCE_TYPE[0] && v.categoryId !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "categoryId must be null when sourceType is SURPLUS",
        path: ["categoryId"],
      });
    }
    if (v.sourceType === DISTRIBUTION_SOURCE_TYPE[1] && v.categoryId === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "categoryId is required when sourceType is CATEGORY",
        path: ["categoryId"],
      });
    }
  });

export type DistributionRuleDTO = z.infer<typeof DistributionRuleSchema>;
