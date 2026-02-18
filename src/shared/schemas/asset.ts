// shared/schemas/asset.ts
import { z } from "zod";
import { IdSchema, IsoDateSchema, IsoTimestampSchema, CurrencyCodeSchema, MoneySchema } from "./common";

const AssetCommonEditable = z.object({
  fundId: IdSchema,
  accountId: IdSchema,

  name: z.string().min(1),
  description: z.string().nullable().optional().default(null),
});

/**
 * ----- UPSERT INPUT (renderer -> main) -----
 * - assetId optional (missing => insert)
 * - NO createdAt/updatedAt allowed
 */
const AssetUpsertBase = AssetCommonEditable.extend({
  assetId: IdSchema.optional(),
});

export const CashAssetUpsertInputSchema = AssetUpsertBase.extend({
  assetType: z.literal("CASH"),
  currencyCode: CurrencyCodeSchema,
});

export const StockAssetUpsertInputSchema = AssetUpsertBase.extend({
  assetType: z.literal("STOCK"),
  ticker: z.string().min(1).max(15),
});

export const NoteAssetUpsertInputSchema = AssetUpsertBase.extend({
  assetType: z.literal("NOTE"),
  counterparty: z.string().min(1).nullable(),
  interestRate: z.number().finite().min(0).max(1),
  startDate: IsoDateSchema.nullable(),
  maturityDate: IsoDateSchema.nullable(),
});

export const AssetUpsertInputSchema = z.discriminatedUnion("assetType", [
  CashAssetUpsertInputSchema,
  StockAssetUpsertInputSchema,
  NoteAssetUpsertInputSchema,
]);

/**
 * ----- CANONICAL STORED RECORD (main -> renderer) -----
 * - assetId required
 * - timestamps included
 */
const AssetStoredBase = AssetCommonEditable.extend({
  assetId: IdSchema,
  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

export const CashAssetSchema = AssetStoredBase.extend({
  assetType: z.literal("CASH"),
  currencyCode: CurrencyCodeSchema,
});

export const StockAssetSchema = AssetStoredBase.extend({
  assetType: z.literal("STOCK"),
  ticker: z.string().min(1).max(15),
});

export const NoteAssetSchema = AssetStoredBase.extend({
  assetType: z.literal("NOTE"),
  counterparty: z.string().min(1).nullable(),
  interestRate: z.number().finite().min(0).max(1),
  startDate: IsoDateSchema.nullable(),
  maturityDate: IsoDateSchema.nullable(),
});

export const AssetSchema = z.discriminatedUnion("assetType", [
  CashAssetSchema,
  StockAssetSchema,
  NoteAssetSchema,
]);

const AssetBalanceFields = {
  moneyBalanceMinor: MoneySchema,
  quantityBalanceMinor: z.number().int(),
};

export const CashAssetWithBalanceSchema = CashAssetSchema.extend(AssetBalanceFields);

export const StockAssetWithBalanceSchema = StockAssetSchema.extend(AssetBalanceFields);

export const NoteAssetWithBalanceSchema = NoteAssetSchema.extend(AssetBalanceFields);

export const AssetWithBalanceSchema = z.discriminatedUnion("assetType", [
  CashAssetWithBalanceSchema,
  StockAssetWithBalanceSchema,
  NoteAssetWithBalanceSchema,
]);

export type AssetDTO = z.infer<typeof AssetSchema>;
export type AssetUpsertInputDTO = z.infer<typeof AssetUpsertInputSchema>;
export type AssetWithBalanceDTO = z.infer<typeof AssetWithBalanceSchema>;
