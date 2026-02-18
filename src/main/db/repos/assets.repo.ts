// main/db/repos/assets.repo.ts
import Database from "better-sqlite3";
import type { Asset, AssetUpsertInput, AssetWithBalance } from "../../../shared/types/asset";
import {
  mapAsset,
  mapAssetWithBalance,
  type DbAssetJoinedRow,
  type DbAssetWithBalanceJoinedRow,
} from "../mappers/assets.mapper";
import { nowIso, newId, assertChanges } from "../mappers/common";

type ExistingAssetRow = {
  asset_id: string;
  asset_type: "CASH" | "STOCK" | "NOTE";
};

export class AssetsRepo {
  constructor(private db: Database.Database) {}

  private joinedSelect = `
    SELECT
      a.asset_id, a.fund_id, a.account_id, a.name, a.description, a.asset_type, a.created_at, a.updated_at,
      c.currency_code,
      s.ticker,
      n.counterparty, n.interest_rate, n.start_date, n.maturity_date
    FROM assets a
    LEFT JOIN cash   c ON c.asset_id = a.asset_id
    LEFT JOIN stocks s ON s.asset_id = a.asset_id
    LEFT JOIN notes  n ON n.asset_id = a.asset_id
  `;

  list(): Asset[] {
    const rows = this.db
      .prepare(
        `
        ${this.joinedSelect}
        ORDER BY a.name COLLATE NOCASE
      `
      )
      .all() as DbAssetJoinedRow[];

    return rows.map(mapAsset);
  }

  listWithBalances(): AssetWithBalance[] {
    const rows = this.db
      .prepare(
        `
        WITH asset_balances AS (
          SELECT
            asset_id,
            COALESCE(SUM(money_delta_minor), 0) AS money_balance_minor,
            COALESCE(SUM(quantity_delta_minor), 0) AS quantity_balance_minor
          FROM fund_event_line
          WHERE asset_id IS NOT NULL
          GROUP BY asset_id
        )
        SELECT
          base.*,
          COALESCE(ab.money_balance_minor, 0) AS money_balance_minor,
          COALESCE(ab.quantity_balance_minor, 0) AS quantity_balance_minor
        FROM (
          ${this.joinedSelect}
        ) base
        LEFT JOIN asset_balances ab ON ab.asset_id = base.asset_id
        ORDER BY base.name COLLATE NOCASE
      `
      )
      .all() as DbAssetWithBalanceJoinedRow[];

    return rows.map(mapAssetWithBalance);
  }

  listByFund(fundId: string): Asset[] {
    const rows = this.db
      .prepare(
        `
        ${this.joinedSelect}
        WHERE a.fund_id = ?
        ORDER BY a.name COLLATE NOCASE
      `
      )
      .all(fundId) as DbAssetJoinedRow[];

    return rows.map(mapAsset);
  }

  listByFundAndAccount(fundId: string, accountId: string): Asset[] {
    const rows = this.db
      .prepare(
        `
        ${this.joinedSelect}
        WHERE a.fund_id = ? AND a.account_id = ?
        ORDER BY a.name COLLATE NOCASE
      `
      )
      .all(fundId, accountId) as DbAssetJoinedRow[];

    return rows.map(mapAsset);
  }

  getById(assetId: string): Asset | null {
    const row = this.db
      .prepare(
        `
        ${this.joinedSelect}
        WHERE a.asset_id = ?
      `
      )
      .get(assetId) as DbAssetJoinedRow | undefined;

    return row ? mapAsset(row) : null;
  }

  /**
   * Upsert by primary key (asset_id).
   * - Insert: sets created_at/updated_at to now.
   * - Update: preserves created_at, bumps updated_at to now.
   * - If assetType changes, removes old subtype row(s) and writes the new subtype.
   */
  upsert(input: AssetUpsertInput): Asset {
    const id = input.assetId?.trim() ? input.assetId : newId();
    const ts = nowIso();

    const getExisting = this.db.prepare(`
      SELECT asset_id, asset_type
      FROM assets
      WHERE asset_id = ?
    `);

    const insertBase = this.db.prepare(`
      INSERT INTO assets (
        asset_id, fund_id, account_id, name, description, asset_type, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const updateBase = this.db.prepare(`
      UPDATE assets
      SET
        fund_id      = ?,
        account_id   = ?,
        name         = ?,
        description  = ?,
        asset_type   = ?,
        updated_at   = ?
      WHERE asset_id = ?
    `);

    const deleteCash = this.db.prepare(`DELETE FROM cash   WHERE asset_id = ?`);
    const deleteStock = this.db.prepare(`DELETE FROM stocks WHERE asset_id = ?`);
    const deleteNote = this.db.prepare(`DELETE FROM notes  WHERE asset_id = ?`);

    const upsertCash = this.db.prepare(`
      INSERT INTO cash (asset_id, currency_code)
      VALUES (?, ?)
      ON CONFLICT(asset_id) DO UPDATE SET
        currency_code = excluded.currency_code
    `);

    const upsertStock = this.db.prepare(`
      INSERT INTO stocks (asset_id, ticker)
      VALUES (?, ?)
      ON CONFLICT(asset_id) DO UPDATE SET
        ticker = excluded.ticker
    `);

    const upsertNote = this.db.prepare(`
      INSERT INTO notes (asset_id, counterparty, interest_rate, start_date, maturity_date)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(asset_id) DO UPDATE SET
        counterparty  = excluded.counterparty,
        interest_rate = excluded.interest_rate,
        start_date    = excluded.start_date,
        maturity_date = excluded.maturity_date
    `);

    const existing = getExisting.get(id) as ExistingAssetRow | undefined;

    if (!existing) {
      const r = insertBase.run(
        id,
        input.fundId,
        input.accountId,
        input.name,
        input.description ?? null,
        input.assetType,
        ts,
        ts
      );
      assertChanges(r, "Failed to insert asset");
    } else {
      if (existing.asset_type !== input.assetType) {
        deleteCash.run(id);
        deleteStock.run(id);
        deleteNote.run(id);
      }

      updateBase.run(
        input.fundId,
        input.accountId,
        input.name,
        input.description ?? null,
        input.assetType,
        ts,
        id
      );
    }

    if (input.assetType === "CASH") {
      upsertCash.run(id, input.currencyCode);
    } else if (input.assetType === "STOCK") {
      upsertStock.run(id, input.ticker);
    } else {
      upsertNote.run(
        id,
        input.counterparty ?? null,
        input.interestRate,
        input.startDate ?? null,
        input.maturityDate ?? null
      );
    }

  return this.getById(id)!;
}


  delete(assetId: string): void {
    // CASCADE will remove subtype rows (cash/stocks/notes).
    const result = this.db.prepare(`DELETE FROM assets WHERE asset_id = ?`).run(assetId);
    assertChanges(result, `Asset not found (delete): ${assetId}`);
  }
}
