// src/renderer/src/components/features/funds/events/types/eventTypes.helpers.ts
import type { EventType, EventTypeEditable } from "../../../../../../../../shared/types/event_type";

export type EventTypeUpsertInput = {
  eventTypeId?: string; // undefined => create, set => update
  eventType: EventTypeEditable;
};

export function makeDraftEventType(): EventTypeUpsertInput {
  return { eventType: { eventType: "" } };
}

export function upsertInputFromEventType(row: EventType): EventTypeUpsertInput {
  return { eventTypeId: row.eventTypeId, eventType: { eventType: row.eventType } };
}

export function normalizeEventTypeUpsert(input: EventTypeUpsertInput): EventTypeUpsertInput {
  return {
    ...input,
    eventType: { eventType: input.eventType.eventType.trim() },
  };
}
