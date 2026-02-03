// main/db/mappers/event_types.mapper.ts
import type { EventType } from "../../../shared/types/event_type";

export type DbEventTypeRow = {
  event_type_id: string;
  event_type: string;
  created_at: string;
  updated_at: string;
};

export function mapEventType(row: DbEventTypeRow): EventType {
  return {
    eventTypeId: row.event_type_id,
    eventType: row.event_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
