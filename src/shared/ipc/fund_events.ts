// shared/ipc/fund_events.ts
import { z } from "zod";
import { IdSchema, IsoDateSchema } from "../schemas/common";
import { FundEventSchema } from "../schemas/fund_event";
import { FundEventWithLinesSchema } from "../schemas/fund_event_line";

export const FUND_EVENTS_IPC = {
  ListByDateRange: "fund-events:list-by-date-range",
  GetById: "fund-events:get-by-id",
  Upsert: "fund-events:upsert",
  Delete: "fund-events:delete",
} as const;

export const ListByDateRangeReq = z.object({
  startDate: IsoDateSchema,
  endDate: IsoDateSchema,
});
export const ListByDateRangeRes = z.object({
  events: z.array(FundEventSchema),
});

export const GetByIdReq = z.object({ eventId: IdSchema });
export const GetByIdRes = z.object({
  data: FundEventWithLinesSchema.nullable(),
});

export const UpsertReq = z.object({
  data: FundEventWithLinesSchema,
});
export const UpsertRes = z.object({ ok: z.literal(true) });

export const DeleteReq = z.object({ eventId: IdSchema });
export const DeleteRes = z.object({ ok: z.literal(true) });
