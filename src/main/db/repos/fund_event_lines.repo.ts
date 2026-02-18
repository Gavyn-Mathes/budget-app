// main/db/repos/fund_event_lines.repo.ts
import Database from "better-sqlite3";
import type { FundEventLine } from "../../../shared/types/fund_event_line";
import { mapFundEventLine, type DbFundEventLineRow } from "../mappers/fund_event_lines.mapper";

export class FundEventLineRepo {
  constructor(private db: Database.Database) {}

  listByEvent(eventId: string): FundEventLine[] {
    const rows = this.db
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

    return rows.map(mapFundEventLine);
  }

  listByAsset(assetId: string): FundEventLine[] {
    const rows = this.db
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
        WHERE asset_id = ?
        ORDER BY created_at ASC, event_id ASC, line_no ASC
      `
      )
      .all(assetId) as DbFundEventLineRow[];

    return rows.map(mapFundEventLine);
  }

  listByLiability(liabilityId: string): FundEventLine[] {
    const rows = this.db
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
        WHERE liability_id = ?
        ORDER BY created_at ASC, event_id ASC, line_no ASC
      `
      )
      .all(liabilityId) as DbFundEventLineRow[];

    return rows.map(mapFundEventLine);
  }
}
