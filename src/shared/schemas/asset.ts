// shared/schemas/asset.ts
import { z } from "zod";
import { IdSchema, IsoDateSchema, IsoTimestampSchema, CurrencyCodeSchema } from "./common";
import { ASSET_TYPE } from "../constants/asset";

const AssetBase = z.object({
  assetId: IdSchema,
  fundId: IdSchema,
  accountId: IdSchema,

  name: z.string().min(1),
  description: z.string().nullable(),

  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,

  assetType: z.enum(ASSET_TYPE),
});

export const CashAssetSchema = AssetBase.extend({
  assetType: z.literal("CASH"),
  currencyCode: CurrencyCodeSchema,
});

export const StockAssetSchema = AssetBase.extend({
  assetType: z.literal("STOCK"),
  ticker: z.string().min(1).max(15),
});

export const NoteAssetSchema = AssetBase.extend({
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

export type AssetDTO = z.infer<typeof AssetSchema>;
