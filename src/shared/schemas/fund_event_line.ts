// shared/schemas/fund_event_line.ts
import { z } from "zod";
import { IdSchema, MoneySchema, IsoTimestampSchema } from "./common";
import { FundEventSchema, FundEventUpsertInputSchema } from "./fund_event";

export const FundEventLineKindSchema = z.enum([
  "ASSET_QUANTITY",
  "ASSET_MONEY",
  "LIABILITY_MONEY",
]);

const StoredBase = z.object({
  lineId: IdSchema,
  eventId: IdSchema,
  lineNo: z.number().int().nonnegative(),

  lineKind: FundEventLineKindSchema,

  // informational / optional
  unitPrice: z.string().nullable(),
  fee: MoneySchema.nonnegative().nullable(),
  notes: z.string().nullable(),

  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

// Asset line that changes units (e.g. +0.5 shares -> +500000 micros)
const StoredAssetQuantityLine = StoredBase.extend({
  lineKind: z.literal("ASSET_QUANTITY"),
  assetId: IdSchema,
  liabilityId: z.null(),

  quantityDeltaMinor: z.number().int(),
  moneyDelta: z.null(),
});

// Asset line that changes money (cash movements, transfers)
const StoredAssetMoneyLine = StoredBase.extend({
  lineKind: z.literal("ASSET_MONEY"),
  assetId: IdSchema,
  liabilityId: z.null(),

  quantityDeltaMinor: z.null(),
  moneyDelta: MoneySchema, // ideally integer cents
});

// Liability line that changes money owed
const StoredLiabilityMoneyLine = StoredBase.extend({
  lineKind: z.literal("LIABILITY_MONEY"),
  assetId: z.null(),
  liabilityId: IdSchema,

  quantityDeltaMinor: z.null(),
  moneyDelta: MoneySchema, // ideally integer cents
});

export const FundEventLineSchema = z.discriminatedUnion("lineKind", [
  StoredAssetQuantityLine,
  StoredAssetMoneyLine,
  StoredLiabilityMoneyLine,
]);

const UpsertBase = z.object({
  lineId: IdSchema.optional(),
  lineNo: z.number().int().nonnegative().optional(),

  unitPrice: z.string().nullable().optional().default(null),
  fee: MoneySchema.nonnegative().nullable().optional().default(null),
  notes: z.string().nullable().optional().default(null),
});

const UpsertAssetQuantityLine = UpsertBase.extend({
  lineKind: z.literal("ASSET_QUANTITY"),
  assetId: IdSchema,
  liabilityId: z.null(),

  quantityDeltaMinor: z.number().int(),
  moneyDelta: z.null(),
});

const UpsertAssetMoneyLine = UpsertBase.extend({
  lineKind: z.literal("ASSET_MONEY"),
  assetId: IdSchema,
  liabilityId: z.null(),

  quantityDeltaMinor: z.null(),
  moneyDelta: MoneySchema,
});

const UpsertLiabilityMoneyLine = UpsertBase.extend({
  lineKind: z.literal("LIABILITY_MONEY"),
  assetId: z.null(),
  liabilityId: IdSchema,

  quantityDeltaMinor: z.null(),
  moneyDelta: MoneySchema,
});

export const FundEventLineUpsertInputSchema = z.discriminatedUnion("lineKind", [
  UpsertAssetQuantityLine,
  UpsertAssetMoneyLine,
  UpsertLiabilityMoneyLine,
]);

export const FundEventWithLinesSchema = z.object({
  event: FundEventSchema,
  lines: z.array(FundEventLineSchema),
});

export const FundEventWithLinesUpsertInputSchema = z.object({
  event: FundEventUpsertInputSchema,
  lines: z.array(FundEventLineUpsertInputSchema),
});

export type FundEventLineDTO = z.infer<typeof FundEventLineSchema>;
export type FundEventLineUpsertInputDTO = z.infer<typeof FundEventLineUpsertInputSchema>;
export type FundEventWithLinesDTO = z.infer<typeof FundEventWithLinesSchema>;
export type FundEventWithLinesUpsertInputDTO = z.infer<typeof FundEventWithLinesUpsertInputSchema>;
