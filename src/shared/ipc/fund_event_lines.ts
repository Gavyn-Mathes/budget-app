// shared/ipc/fund_event_lines.ts
import { z } from "zod";
import { IdSchema } from "../schemas/common";
import { FundEventLineSchema } from "../schemas/fund_event_line";

export const FUND_EVENT_LINES_IPC = {
  ListByEvent: "fund-event-lines:list-by-event",
  ListByAsset: "fund-event-lines:list-by-asset",
  ListByLiability: "fund-event-lines:list-by-liability",
} as const;

export const ListByEventReq = z.object({ eventId: IdSchema });
export const ListByEventRes = z.object({ lines: z.array(FundEventLineSchema) });

export const ListByAssetReq = z.object({ assetId: IdSchema });
export const ListByAssetRes = z.object({ lines: z.array(FundEventLineSchema) });

export const ListByLiabilityReq = z.object({ liabilityId: IdSchema });
export const ListByLiabilityRes = z.object({ lines: z.array(FundEventLineSchema) });
