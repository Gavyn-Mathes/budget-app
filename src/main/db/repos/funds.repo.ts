// main/db/repos/funds.repo.ts
import Database from "better-sqlite3";
import type { Fund, FundUpsertInput } from "../../../shared/types/fund";
import { mapFund, type DbFundRow, DbFundWithTotalsRow } from "../mappers/funds.mapper";
import { nowIso, newId, assertChanges } from "../mappers/common";

export class FundsRepo {
  constructor(private db: Database.Database) {}

  list(): Fund[] {
    const rows = this.db
      .prepare(
        `
        SELECT fund_id, name, description, created_at, updated_at
        FROM funds
        ORDER BY name COLLATE NOCASE
      `
      )
      .all() as DbFundRow[];

    return rows.map(mapFund);
  }

  listWithTotalsRows(): DbFundWithTotalsRow[] {
    return this.db
      .prepare(
        `
        WITH fund_lines AS (
          SELECT a.fund_id AS fund_id, l.money_delta_minor AS money_delta_minor, 1 AS is_asset, 0 AS is_liability
          FROM fund_event_line l
          JOIN assets a ON a.asset_id = l.asset_id
          WHERE l.asset_id IS NOT NULL

          UNION ALL

          SELECT li.fund_id AS fund_id, l.money_delta_minor AS money_delta_minor, 0 AS is_asset, 1 AS is_liability
          FROM fund_event_line l
          JOIN liability li ON li.liability_id = l.liability_id
          WHERE l.liability_id IS NOT NULL
        )
        SELECT
          f.fund_id,
          f.name,
          f.description,
          f.created_at,
          f.updated_at,
          COALESCE(SUM(CASE WHEN fl.is_asset = 1 THEN fl.money_delta_minor ELSE 0 END), 0) AS assets_minor,
          COALESCE(SUM(CASE WHEN fl.is_liability = 1 THEN fl.money_delta_minor ELSE 0 END), 0) AS liabilities_minor
        FROM funds f
        LEFT JOIN fund_lines fl ON fl.fund_id = f.fund_id
        GROUP BY f.fund_id
        ORDER BY f.name COLLATE NOCASE, f.fund_id
        `
      )
      .all() as DbFundWithTotalsRow[];
  }

  getById(fundId: string): Fund | null {
    const row = this.db
      .prepare(
        `
        SELECT fund_id, name, description, created_at, updated_at
        FROM funds
        WHERE fund_id = ?
      `
      )
      .get(fundId) as DbFundRow | undefined;

    return row ? mapFund(row) : null;
  }

  /**
   * Upsert by primary key (fund_id).
   * - Insert: created_at/updated_at = now
   * - Update: preserve created_at, bump updated_at
   *
   * name is UNIQUE (ux_funds_name), so conflicting names will throw.
   */
  upsert(input: FundUpsertInput): Fund {
    const id = input.fundId?.trim() ? input.fundId : newId();
    const ts = nowIso();

    const existing = this.db
      .prepare(`SELECT created_at FROM funds WHERE fund_id = ?`)
      .get(id) as { created_at: string } | undefined;

    const createdAt = existing?.created_at ?? ts;

    this.db
      .prepare(
        `
        INSERT INTO funds (fund_id, name, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(fund_id) DO UPDATE SET
          name        = excluded.name,
          description = excluded.description,
          updated_at  = excluded.updated_at
      `
      )
      .run(id, input.name, input.description ?? null, createdAt, ts);

    return this.getById(id)!;
  }

  delete(fundId: string): void {
    const result = this.db.prepare(`DELETE FROM funds WHERE fund_id = ?`).run(fundId);
    assertChanges(result, `Fund not found (delete): ${fundId}`);
  }
}
