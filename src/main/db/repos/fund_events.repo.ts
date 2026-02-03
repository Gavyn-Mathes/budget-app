// main/db/repos/fund_event.repo.ts
import Database from "better-sqlite3";
import type { FundEvent } from "../../../shared/types/fund_event";
import type { FundEventWithLines } from "../../../shared/types/fund_event_line";
import { mapFundEvent, type DbFundEventRow } from "../mappers/fund_events.mapper";
import { mapFundEventLine, type DbFundEventLineRow } from "../mappers/fund_event_lines.mapper";
import { nowIso, newId } from "../mappers/common";

export class FundEventRepo {
  constructor(private db: Database.Database) {}

  listByDateRange(startDate: string, endDate: string): FundEvent[] {
    const rows = this.db
      .prepare(
        `
        SELECT event_id, event_date, event_type_id, memo, created_at, updated_at
        FROM fund_event
        WHERE event_date >= ? AND event_date <= ?
        ORDER BY event_date, event_id
      `
      )
      .all(startDate, endDate) as DbFundEventRow[];

    return rows.map(mapFundEvent);
  }

  getById(eventId: string): FundEventWithLines | null {
    const eventRow = this.db
      .prepare(
        `
        SELECT event_id, event_date, event_type_id, memo, created_at, updated_at
        FROM fund_event
        WHERE event_id = ?
      `
      )
      .get(eventId) as DbFundEventRow | undefined;

    if (!eventRow) return null;

    const lineRows = this.db
      .prepare(
        `
        SELECT
          line_id, event_id,
          asset_id, liability_id,
          quantity_delta, balance_delta,
          unit_price, fee, notes,
          created_at, updated_at
        FROM fund_event_line
        WHERE event_id = ?
        ORDER BY line_id
      `
      )
      .all(eventId) as DbFundEventLineRow[];

    return {
      event: mapFundEvent(eventRow),
      lines: lineRows.map(mapFundEventLine),
    };
  }

  /**
   * Upsert event + lines transactionally.
   * Replace-all semantics for lines:
   * - any existing lines for this event not present in payload are deleted.
   */
  upsert(data: FundEventWithLines): FundEventWithLines {
    const inputEvent = data.event;
    const inputLines = data.lines ?? [];

    const eventId = inputEvent.eventId?.trim() ? inputEvent.eventId : newId();
    const ts = nowIso();

    const selectEventCreatedAt = this.db.prepare(`
      SELECT created_at
      FROM fund_event
      WHERE event_id = ?
    `);

    const insertOrUpdateEvent = this.db.prepare(`
      INSERT INTO fund_event (event_id, event_date, event_type_id, memo, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(event_id) DO UPDATE SET
        event_date    = excluded.event_date,
        event_type_id = excluded.event_type_id,
        memo          = excluded.memo,
        updated_at    = excluded.updated_at
    `);

    const selectLineCreatedAt = this.db.prepare(`
      SELECT created_at
      FROM fund_event_line
      WHERE line_id = ?
    `);

    const upsertLine = this.db.prepare(`
      INSERT INTO fund_event_line (
        line_id, event_id,
        asset_id, liability_id,
        quantity_delta, balance_delta,
        unit_price, fee, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(line_id) DO UPDATE SET
        event_id        = excluded.event_id,
        asset_id        = excluded.asset_id,
        liability_id    = excluded.liability_id,
        quantity_delta  = excluded.quantity_delta,
        balance_delta   = excluded.balance_delta,
        unit_price      = excluded.unit_price,
        fee             = excluded.fee,
        notes           = excluded.notes,
        updated_at      = excluded.updated_at
    `);

    const deleteAllLinesForEvent = this.db.prepare(`
      DELETE FROM fund_event_line
      WHERE event_id = ?
    `);

    const tx = this.db.transaction(() => {
      const existingEvent = selectEventCreatedAt.get(eventId) as { created_at: string } | undefined;
      const createdAt = existingEvent?.created_at ?? ts;

      insertOrUpdateEvent.run(
        eventId,
        inputEvent.eventDate,
        inputEvent.eventTypeId,
        inputEvent.memo ?? null,
        createdAt,
        ts
      );

      const desiredLineIds: string[] = [];

      for (const line of inputLines) {
        const lineId = line.lineId?.trim() ? line.lineId : newId();
        desiredLineIds.push(lineId);

        const existingLine = selectLineCreatedAt.get(lineId) as { created_at: string } | undefined;
        const lineCreatedAt = existingLine?.created_at ?? ts;

        const isAssetLine = line.assetId !== null;
        const assetId = isAssetLine ? line.assetId : null;
        const liabilityId = isAssetLine ? null : line.liabilityId;

        const quantityDelta = isAssetLine ? line.quantityDelta : null;
        const balanceDelta = isAssetLine ? null : (line.balanceDelta as any as number);

        upsertLine.run(
          lineId,
          eventId,
          assetId,
          liabilityId,
          quantityDelta,
          balanceDelta,
          line.unitPrice === null ? null : (line.unitPrice as any as number),
          line.fee === null ? null : (line.fee as any as number),
          line.notes ?? null,
          lineCreatedAt,
          ts
        );
      }

      if (desiredLineIds.length === 0) {
        deleteAllLinesForEvent.run(eventId);
      } else {
        const placeholders = desiredLineIds.map(() => "?").join(", ");
        this.db
          .prepare(
            `
            DELETE FROM fund_event_line
            WHERE event_id = ?
              AND line_id NOT IN (${placeholders})
          `
          )
          .run(eventId, ...desiredLineIds);
      }
    });

    tx();
    return this.getById(eventId)!;
  }

  delete(eventId: string): void {
    // idempotent; IPC expects ok:true
    this.db.prepare(`DELETE FROM fund_event WHERE event_id = ?`).run(eventId);
  }
}
