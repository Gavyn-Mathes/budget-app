// main/db/repos/fund_events.repo.ts
import Database from "better-sqlite3";
import type { FundEvent } from "../../../shared/types/fund_event";
import type {
  FundEventWithLines,
  FundEventWithLinesUpsertInput,
} from "../../../shared/types/fund_event_line";
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
          line_id,
          event_id,
          line_no,

          asset_id,
          liability_id,

          line_kind,
          quantity_delta_minor,
          money_delta_minor,

          unit_price,
          fee_minor,
          notes,

          created_at,
          updated_at
        FROM fund_event_line
        WHERE event_id = ?
        ORDER BY line_no ASC
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
  upsert(data: FundEventWithLinesUpsertInput): FundEventWithLines {
    const inputEvent = data.event;
    const inputLines = data.lines;

    const eventId = inputEvent.eventId?.trim() ? inputEvent.eventId : newId();
    const ts = nowIso();

    const selectEventCreatedAt = this.db.prepare(`
        SELECT created_at
        FROM fund_event
        WHERE event_id = ?
      `);

    const selectLineOwner = this.db.prepare(`
        SELECT event_id
        FROM fund_event_line
        WHERE line_id = ?
      `);

    const selectExistingLinesForEvent = this.db.prepare(`
        SELECT line_id, line_no, created_at
        FROM fund_event_line
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

    const upsertLine = this.db.prepare(`
        INSERT INTO fund_event_line (
          line_id,
          event_id,
          line_no,

          asset_id,
          liability_id,

          line_kind,
          quantity_delta_minor,
          money_delta_minor,

          unit_price,
          fee_minor,
          notes,

          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(line_id) DO UPDATE SET
          line_no              = excluded.line_no,

          asset_id             = excluded.asset_id,
          liability_id         = excluded.liability_id,

          line_kind            = excluded.line_kind,
          quantity_delta_minor = excluded.quantity_delta_minor,
          money_delta_minor    = excluded.money_delta_minor,

          unit_price           = excluded.unit_price,
          fee_minor            = excluded.fee_minor,
          notes                = excluded.notes,

          updated_at           = excluded.updated_at
      `);

    const deleteLineAtNoExcept = this.db.prepare(`
        DELETE FROM fund_event_line
        WHERE event_id = ?
          AND line_no = ?
          AND line_id <> ?
      `);

    const deleteAllLinesForEvent = this.db.prepare(`
        DELETE FROM fund_event_line
        WHERE event_id = ?
      `);

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

    const existingLines = selectExistingLinesForEvent.all(eventId) as Array<{
      line_id: string;
      line_no: number;
      created_at: string;
    }>;
    const existingByLineId = new Map(existingLines.map((x) => [x.line_id, x] as const));
    const existingLineIdByNo = new Map(existingLines.map((x) => [x.line_no, x.line_id] as const));

    // Replace-all semantics, but preserve created_at for line_ids that remain.
    const desiredLineIds: string[] = [];

    for (let i = 0; i < inputLines.length; i++) {
      const line = inputLines[i];
      // Server-authoritative ordering: line_no is always payload order.
      const lineNo = i;
      const requestedLineId = line.lineId?.trim() ? line.lineId : null;
      const lineId = requestedLineId ?? existingLineIdByNo.get(lineNo) ?? newId();
      desiredLineIds.push(lineId);

      const existingLine = existingByLineId.get(lineId);
      const lineCreatedAt = existingLine?.created_at ?? ts;

      let assetId: string | null = null;
      let liabilityId: string | null = null;

      let quantityDeltaMinor: number | null = null;
      let moneyDeltaMinor: number | null = null;

      if (line.lineKind === "ASSET_QUANTITY") {
        assetId = line.assetId;
        liabilityId = null;
        quantityDeltaMinor = line.quantityDeltaMinor;
        moneyDeltaMinor = null;
      } else if (line.lineKind === "ASSET_MONEY") {
        assetId = line.assetId;
        liabilityId = null;
        quantityDeltaMinor = null;
        moneyDeltaMinor = line.moneyDelta;
      } else {
        // LIABILITY_MONEY
        assetId = null;
        liabilityId = line.liabilityId;
        quantityDeltaMinor = null;
        moneyDeltaMinor = line.moneyDelta;
      }

      const unitPrice = line.unitPrice ?? null; // string|null (informational)
      const feeMinor = line.fee == null ? null : line.fee;
      const notes = line.notes ?? null;

      if (requestedLineId) {
        const owner = selectLineOwner.get(lineId) as { event_id: string } | undefined;
        if (owner && owner.event_id !== eventId) {
          throw new Error(
            `lineId ${lineId} belongs to event ${owner.event_id}, cannot use in event ${eventId}`
          );
        }
      }

      // Avoid UNIQUE(event_id, line_no) conflicts when caller sends a different lineId for an
      // existing position (line_no). The old row at this position will be removed/replaced.
      deleteLineAtNoExcept.run(eventId, lineNo, lineId);

      upsertLine.run(
        lineId,
        eventId,
        lineNo,

        assetId,
        liabilityId,

        line.lineKind,
        quantityDeltaMinor,
        moneyDeltaMinor,

        unitPrice,
        feeMinor,
        notes,

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

    return this.getById(eventId)!;
  }

  listEventIdsByTypeAndMemo(eventTypeId: string, memo: string): string[] {
    const rows = this.db
      .prepare(
        `
        SELECT event_id
        FROM fund_event
        WHERE event_type_id = ? AND memo = ?
      `
      )
      .all(eventTypeId, memo) as Array<{ event_id: string }>;

    return rows.map((r) => r.event_id);
  }

  delete(eventId: string): void {
    this.db.prepare(`DELETE FROM fund_event WHERE event_id = ?`).run(eventId);
  }
}
