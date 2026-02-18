// shared/schemas/asset_transfer.ts
import { z } from "zod";
import { IdSchema, MoneySchema } from "./common";
import { FundEventUpsertInputSchema } from "./fund_event";

export const AssetAccountTransferInputSchema = z.object({
  event: FundEventUpsertInputSchema,
  fromAssetId: IdSchema,
  toAccountId: IdSchema,
  toAssetId: IdSchema.optional(),
  quantityDeltaMinor: z.number().int().optional().nullable(),
  moneyDelta: MoneySchema.optional().nullable(),
  unitPrice: z.string().nullable().optional().default(null),
  fee: MoneySchema.nonnegative().optional().nullable().default(null),
  notes: z.string().nullable().optional().default(null),
});

export type AssetAccountTransferInputDTO = z.infer<typeof AssetAccountTransferInputSchema>;
