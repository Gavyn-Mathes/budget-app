// shared/ipc/fund_events.ts
import { z } from "zod";
import { IdSchema, IsoDateSchema } from "../schemas/common";
import { FundEventSchema } from "../schemas/fund_event";
import { FundEventWithLinesSchema, FundEventWithLinesUpsertInputSchema } from "../schemas/fund_event_line";
import { AssetAccountTransferInputSchema } from "../schemas/asset_transfer";

export const FUND_EVENTS_IPC = {
  ListByDateRange: "fund-events:list-by-date-range",
  GetById: "fund-events:get-by-id",
  Upsert: "fund-events:upsert",
  MoveAssetToAccount: "fund-events:move-asset-to-account",
  Delete: "fund-events:delete",
} as const;

export const ListByDateRangeReq = z.object({
  startDate: IsoDateSchema,
  endDate: IsoDateSchema,
});
export const ListByDateRangeRes = z.object({
  fundEvents: z.array(FundEventSchema),
});

export const GetByIdReq = z.object({ eventId: IdSchema });
export const GetByIdRes = z.object({
  data: FundEventWithLinesSchema.nullable(),
});

export const UpsertReq = z.object({
  data: FundEventWithLinesUpsertInputSchema,
});
export const UpsertRes = z.object({
  ok: z.literal(true),
  data: FundEventWithLinesSchema,
});

export const MoveAssetToAccountReq = z.object({
  data: AssetAccountTransferInputSchema,
});
export const MoveAssetToAccountRes = z.object({
  ok: z.literal(true),
  data: FundEventWithLinesSchema,
});

export const DeleteReq = z.object({ eventId: IdSchema });
export const DeleteRes = z.object({ ok: z.literal(true) });
