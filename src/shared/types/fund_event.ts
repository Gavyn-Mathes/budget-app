// shared/types/fund_event.ts
import type { Id, IsoDate, IsoTimestamp } from "./common";
import type { EventTypeId } from "./event_type";

export type FundEventId = Id;

export interface FundEvent {
  eventId: FundEventId;
  eventTypeId: EventTypeId;   // FK -> event_types.event_type_id
  eventDate: IsoDate;         // "YYYY-MM-DD"
  memo: string | null;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}
