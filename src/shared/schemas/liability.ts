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

const EditableBase = z.object({
  fundId: IdSchema,
  accountId: IdSchema,

  name: z.string().min(1),
  apr: z.number().finite().min(0).max(1).nullable(),

  openedDate: IsoDateSchema.nullable(),

  isActive: z.boolean(),
  notes: z.string().nullable().optional().default(null),

  liabilityType: z.enum(LIABILITY_TYPE),
});

const StoredBase = EditableBase.extend({
  liabilityId: IdSchema,
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

const UpsertBase = EditableBase.extend({
  liabilityId: IdSchema.optional(),
});

export const LoanLiabilitySchema = StoredBase.extend({
  liabilityType: z.literal("LOAN"),
  originalPrincipal: MoneySchema.nonnegative().nullable(),
  maturityDate: IsoDateSchema.nullable(),
  paymentAmount: MoneySchema.nonnegative().nullable(),
  paymentFrequency: z.enum(PAYMENT_FREQUENCY).nullable(),
});

export const CreditLiabilitySchema = StoredBase.extend({
  liabilityType: z.literal("CREDIT"),
  creditLimit: MoneySchema.nonnegative().nullable(),
  dueDay: z.number().int().min(1).max(31).nullable(),
  minPaymentType: z.enum(MIN_PAYMENT_TYPE).nullable(),
  minPaymentValue: z.number().finite().min(0).nullable(),
  statementDay: z.number().int().min(1).max(31).nullable(),
}).superRefine((v, ctx) => {
  if (v.minPaymentType !== null && v.minPaymentValue === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["minPaymentValue"],
      message: "minPaymentValue is required when minPaymentType is set",
    });
  }
  if (v.minPaymentType === "PERCENT" && v.minPaymentValue !== null) {
    if (v.minPaymentValue < 0 || v.minPaymentValue > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["minPaymentValue"],
        message: "minPaymentValue must be between 0 and 1 when minPaymentType is PERCENT",
      });
    }
  }
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

const LiabilityBalanceFields = {
  balanceMinor: MoneySchema,
};

export const LoanLiabilityWithBalanceSchema = LoanLiabilitySchema.extend(LiabilityBalanceFields);

export const CreditLiabilityWithBalanceSchema = CreditLiabilitySchema.extend(LiabilityBalanceFields);

export const LiabilityWithBalanceSchema = z.discriminatedUnion("liabilityType", [
  LoanLiabilityWithBalanceSchema,
  CreditLiabilityWithBalanceSchema,
]);

export const LoanLiabilityUpsertInputSchema = UpsertBase.extend({
  liabilityType: z.literal("LOAN"),
  originalPrincipal: MoneySchema.nonnegative().nullable(),
  maturityDate: IsoDateSchema.nullable(),
  paymentAmount: MoneySchema.nonnegative().nullable(),
  paymentFrequency: z.enum(PAYMENT_FREQUENCY).nullable(),
});

export const CreditLiabilityUpsertInputSchema = UpsertBase.extend({
  liabilityType: z.literal("CREDIT"),
  creditLimit: MoneySchema.nonnegative().nullable(),
  dueDay: z.number().int().min(1).max(31).nullable(),
  minPaymentType: z.enum(MIN_PAYMENT_TYPE).nullable(),
  minPaymentValue: z.number().finite().min(0).nullable(),
  statementDay: z.number().int().min(1).max(31).nullable(),
}).superRefine((v, ctx) => {
  if (v.minPaymentType !== null && v.minPaymentValue === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["minPaymentValue"],
      message: "minPaymentValue is required when minPaymentType is set",
    });
  }
  if (v.minPaymentType === "PERCENT" && v.minPaymentValue !== null) {
    if (v.minPaymentValue < 0 || v.minPaymentValue > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["minPaymentValue"],
        message: "minPaymentValue must be between 0 and 1 when minPaymentType is PERCENT",
      });
    }
  }
  if (v.minPaymentType === null && v.minPaymentValue !== null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["minPaymentType"],
      message: "minPaymentType must be set if minPaymentValue is set",
    });
  }
});

export const LiabilityUpsertInputSchema = z.discriminatedUnion("liabilityType", [
  LoanLiabilityUpsertInputSchema,
  CreditLiabilityUpsertInputSchema,
]);

export type LiabilityDTO = z.infer<typeof LiabilitySchema>;
export type LiabilityUpsertInputDTO = z.infer<typeof LiabilityUpsertInputSchema>;
export type LiabilityWithBalanceDTO = z.infer<typeof LiabilityWithBalanceSchema>;
