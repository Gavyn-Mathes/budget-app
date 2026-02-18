// main/db/repos/event_types.repo.ts
import Database from "better-sqlite3";
import type { EventType, EventTypeEditable } from "../../../shared/types/event_type";
import { mapEventType, type DbEventTypeRow } from "../mappers/event_types.mapper";
import { nowIso, newId, assertChanges } from "../mappers/common";

export class EventTypesRepo {
  constructor(private db: Database.Database) {}

  list(): EventType[] {
    const rows = this.db
      .prepare(
        `
        SELECT event_type_id, event_type, created_at, updated_at
        FROM event_types
        ORDER BY event_type COLLATE NOCASE
      `
      )
      .all() as DbEventTypeRow[];

    return rows.map(mapEventType);
  }

  getById(eventTypeId: string): EventType | null {
    const row = this.db
      .prepare(
        `
        SELECT event_type_id, event_type, created_at, updated_at
        FROM event_types
        WHERE event_type_id = ?
      `
      )
      .get(eventTypeId) as DbEventTypeRow | undefined;

    return row ? mapEventType(row) : null;
  }

  getByName(eventType: string): EventType | null {
    const row = this.db
      .prepare(
        `
        SELECT event_type_id, event_type, created_at, updated_at
        FROM event_types
        WHERE event_type = ?
      `
      )
      .get(eventType) as DbEventTypeRow | undefined;

    return row ? mapEventType(row) : null;
  }

  create(eventType: EventTypeEditable): EventType {
    const id = newId();
    const ts = nowIso();

    const result = this.db
      .prepare(
        `
        INSERT INTO event_types (event_type_id, event_type, created_at, updated_at)
        VALUES (?, ?, ?, ?)
      `
      )
      .run(id, eventType.eventType, ts, ts);

    assertChanges(result, "Failed to insert event_type");
    return this.getById(id)!;
  }

  update(eventTypeId: string, eventType: EventTypeEditable): EventType {
    const existing = this.getById(eventTypeId);
    if (!existing) throw new Error(`EventType not found: ${eventTypeId}`);

    const ts = nowIso();

    const result = this.db
      .prepare(
        `
        UPDATE event_types
        SET event_type = ?, updated_at = ?
        WHERE event_type_id = ?
      `
      )
      .run(eventType.eventType, ts, eventTypeId);

    assertChanges(result, "Failed to update event_type");
    return this.getById(eventTypeId)!;
  }

  delete(eventTypeId: string): void {
    const result = this.db.prepare(`DELETE FROM event_types WHERE event_type_id = ?`).run(eventTypeId);
    assertChanges(result, `EventType not found (delete): ${eventTypeId}`);
  }
}
