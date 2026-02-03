// main/db/repos/funds.repo.ts
import Database from "better-sqlite3";
import type { Fund } from "../../../shared/types/fund";
import { mapFund, type DbFundRow } from "../mappers/funds.mapper";
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
  upsert(input: Fund): Fund {
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
