// shared/schemas/fund_event_line.ts
import { z } from "zod";
import { IdSchema, MoneySchema, IsoTimestampSchema } from "./common";
import { FundEventSchema } from "./fund_event";

const Base = z.object({
  lineId: IdSchema,
  eventId: IdSchema,

  unitPrice: MoneySchema.nonnegative().nullable(), // SQL: unit_price IS NULL OR >= 0
  fee: MoneySchema.nonnegative().nullable(),       // SQL: fee IS NULL OR >= 0
  notes: z.string().nullable(),

  createdAt: IsoTimestampSchema,
  updatedAt: IsoTimestampSchema,
});

const AssetLine = Base.extend({
  assetId: IdSchema,
  liabilityId: z.null(),

  quantityDelta: z.number().finite(), // required
  balanceDelta: z.null(),             // must be null
});

const LiabilityLine = Base.extend({
  assetId: z.null(),
  liabilityId: IdSchema,

  quantityDelta: z.null(),            // must be null
  balanceDelta: MoneySchema,          // required (can be negative/0/positive)
});

export const FundEventLineSchema = z.union([AssetLine, LiabilityLine]);

export const FundEventWithLinesSchema = z.object({
  event: FundEventSchema,
  lines: z.array(FundEventLineSchema),
});

export type FundEventLineDTO = z.infer<typeof FundEventLineSchema>;
export type FundEventWithLinesDTO = z.infer<typeof FundEventWithLinesSchema>;
