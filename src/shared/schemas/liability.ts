// shared/schemas/liability.ts
import { z } from "zod";
import {
  IdSchema,
  IsoDateSchema,
  IsoTimestampSchema,
  MoneySchema,
  CurrencyCodeSchema,
} from "./common";
import { LIABILITY_TYPE, MIN_PAYMENT_TYPE, PAYMENT_FREQUENCY } from "../constants/liability";

const LiabilityBase = z.object({
  liabilityId: IdSchema,
  fundId: IdSchema,
  accountId: IdSchema,

  name: z.string().min(1),

  // SQL: apr IS NULL OR (apr >= 0 AND apr <= 1)
  apr: z.number().finite().min(0).max(1).nullable(),

  currencyCode: CurrencyCodeSchema,
  currentBalance: MoneySchema.nonnegative(),

  openedDate: IsoDateSchema.nullable(),
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,

  isActive: z.boolean(),
  notes: z.string().nullable(),

  liabilityType: z.enum(LIABILITY_TYPE),
});

export const LoanLiabilitySchema = LiabilityBase.extend({
  liabilityType: z.literal("LOAN"),

  originalPrincipal: MoneySchema.nonnegative().nullable(),
  maturityDate: IsoDateSchema.nullable(),
  paymentAmount: MoneySchema.nonnegative().nullable(),
  paymentFrequency: z.enum(PAYMENT_FREQUENCY).nullable(),
});

export const CreditLiabilitySchema = LiabilityBase.extend({
  liabilityType: z.literal("CREDIT"),

  creditLimit: MoneySchema.nonnegative().nullable(),
  dueDay: z.number().int().min(1).max(31).nullable(),

  // SQL: min_payment_type optional, but if set -> value must be set.
  minPaymentType: z.enum(MIN_PAYMENT_TYPE).nullable(),

  // SQL: min_payment_value IS NULL OR >= 0
  minPaymentValue: z.number().finite().min(0).nullable(),

  statementDay: z.number().int().min(1).max(31).nullable(),
}).superRefine((v, ctx) => {
  // Match SQL checks:
  // 1) If min_payment_type is set, value must be set.
  if (v.minPaymentType !== null && v.minPaymentValue === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["minPaymentValue"],
      message: "minPaymentValue is required when minPaymentType is set",
    });
  }

  // 2) If percent-based, value must be 0..1.
  if (v.minPaymentType === "PERCENT" && v.minPaymentValue !== null) {
    if (v.minPaymentValue < 0 || v.minPaymentValue > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["minPaymentValue"],
        message: "minPaymentValue must be between 0 and 1 when minPaymentType is PERCENT",
      });
    }
  }

  // 3) If type is null, prefer value null (stricter than DB but prevents weird state)
  if (v.minPaymentType === null && v.minPaymentValue !== null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["minPaymentType"],
      message: "minPaymentType must be set if minPaymentValue is set",
    });
  }
});

export const LiabilitySchema = z.discriminatedUnion("liabilityType", [
  LoanLiabilitySchema,
  CreditLiabilitySchema,
]);

export type LiabilityDTO = z.infer<typeof LiabilitySchema>;
