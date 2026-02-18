// shared/types/fund_event.ts
import type { FundEventDTO, FundEventUpsertInputDTO } from "../schemas/fund_event";

export type FundEventId = FundEventDTO["eventId"];
export type FundEvent = FundEventDTO;
export type FundEventUpsertInput = FundEventUpsertInputDTO;
