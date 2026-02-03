// shared/types/event_type.ts
import type { Id, IsoTimestamp } from "./common";

export type EventTypeId = Id;

export interface EventType {
  eventTypeId: EventTypeId;
  eventType: string; // display label (e.g., "DEPOSIT", "BUY")
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}
