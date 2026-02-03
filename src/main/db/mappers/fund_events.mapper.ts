// main/db/mappers/fund_events.mapper.ts
import type { FundEvent } from "../../../shared/types/fund_event";

export type DbFundEventRow = {
  event_id: string;
  event_type_id: string;
  event_date: string; // YYYY-MM-DD
  memo: string | null;
  created_at: string;
  updated_at: string;
};

export function mapFundEvent(row: DbFundEventRow): FundEvent {
  return {
    eventId: row.event_id,
    eventTypeId: row.event_type_id,
    eventDate: row.event_date as FundEvent["eventDate"],
    memo: row.memo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
