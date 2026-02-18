// shared/schemas/distribution.ts
import { z } from "zod";
import { IdSchema, MoneySchema, IsoTimestampSchema } from "./common";
import { DISTRIBUTION_SOURCE_TYPE } from "../constants/distribution";

const SourceTypeSchema = z.enum([DISTRIBUTION_SOURCE_TYPE[0], DISTRIBUTION_SOURCE_TYPE[1]]);

const StoredBase = z.object({
  distributionRuleId: IdSchema,
  budgetId: IdSchema,
  fundId: IdSchema,
  assetId: IdSchema.nullable(),
  sourceType: SourceTypeSchema,
  categoryId: IdSchema.nullable(),
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

const UpsertBase = z.object({
  distributionRuleId: IdSchema.optional(),
  budgetId: IdSchema,
  fundId: IdSchema,
  assetId: IdSchema.nullable().optional().default(null),
  sourceType: SourceTypeSchema,
  categoryId: IdSchema.nullable(),
});

const StoredFixed = StoredBase.extend({
  allocationType: z.literal("FIXED"),
  fixedAmount: MoneySchema.nonnegative(),
  percent: z.null(),
});

const StoredPercent = StoredBase.extend({
  allocationType: z.literal("PERCENT"),
  fixedAmount: z.null(),
  percent: z.number().min(0).max(1),
});

const UpsertFixed = UpsertBase.extend({
  allocationType: z.literal("FIXED"),
  fixedAmount: MoneySchema.nonnegative(),
  percent: z.null(),
});

const UpsertPercent = UpsertBase.extend({
  allocationType: z.literal("PERCENT"),
  fixedAmount: z.null(),
  percent: z.number().min(0).max(1),
});

export const DistributionRuleSchema = z
  .discriminatedUnion("allocationType", [StoredFixed, StoredPercent])
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

export const DistributionRuleUpsertInputSchema = z
  .discriminatedUnion("allocationType", [UpsertFixed, UpsertPercent])
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
    if (v.sourceType === DISTRIBUTION_SOURCE_TYPE[1] && v.allocationType !== "PERCENT") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CATEGORY rules must use PERCENT allocation",
        path: ["allocationType"],
      });
    }
  });

export type DistributionRuleDTO = z.infer<typeof DistributionRuleSchema>;
export type DistributionRuleUpsertInputDTO = z.infer<typeof DistributionRuleUpsertInputSchema>;
