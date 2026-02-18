// main/db/repos/accounts.repo.ts
import Database from "better-sqlite3";
import type { Account, AccountUpsertInput } from "../../../shared/types/account";
import {
  mapAccount,
  type DbAccountRow,
  type DbAccountWithTotalsRow,
} from "../mappers/accounts.mapper";
import { nowIso, newId, assertChanges } from "../mappers/common";

export class AccountsRepo {
  constructor(private db: Database.Database) {}

  list(): Account[] {
    const rows = this.db
      .prepare(
        `
        SELECT
          account_id, name, account_type_id, default_currency_code,
          description, created_at, updated_at
        FROM accounts
        ORDER BY name COLLATE NOCASE
      `
      )
      .all() as DbAccountRow[];

    return rows.map(mapAccount);
  }

  listWithTotalsRows(): DbAccountWithTotalsRow[] {
    return this.db
      .prepare(
        `
        WITH account_lines AS (
          SELECT
            a.account_id AS account_id,
            l.money_delta_minor AS money_delta_minor,
            1 AS is_asset,
            0 AS is_liability
          FROM fund_event_line l
          JOIN assets a ON a.asset_id = l.asset_id
          WHERE l.asset_id IS NOT NULL
            AND l.money_delta_minor IS NOT NULL

          UNION ALL

          SELECT
            li.account_id AS account_id,
            l.money_delta_minor AS money_delta_minor,
            0 AS is_asset,
            1 AS is_liability
          FROM fund_event_line l
          JOIN liability li ON li.liability_id = l.liability_id
          WHERE l.liability_id IS NOT NULL
            AND l.money_delta_minor IS NOT NULL
        )
        SELECT
          ac.account_id,
          ac.name,
          ac.account_type_id,
          ac.default_currency_code,
          ac.description,
          ac.created_at,
          ac.updated_at,
          COALESCE(SUM(CASE WHEN al.is_asset = 1 THEN al.money_delta_minor ELSE 0 END), 0) AS assets_minor,
          COALESCE(SUM(CASE WHEN al.is_liability = 1 THEN al.money_delta_minor ELSE 0 END), 0) AS liabilities_minor
        FROM accounts ac
        LEFT JOIN account_lines al ON al.account_id = ac.account_id
        GROUP BY ac.account_id
        ORDER BY ac.name COLLATE NOCASE, ac.account_id
      `
      )
      .all() as DbAccountWithTotalsRow[];
  }

  getById(accountId: string): Account | null {
    const row = this.db
      .prepare(
        `
        SELECT
          account_id, name, account_type_id, default_currency_code,
          description, created_at, updated_at
        FROM accounts
        WHERE account_id = ?
      `
      )
      .get(accountId) as DbAccountRow | undefined;

    return row ? mapAccount(row) : null;
  }

  /**
   * Upsert by primary key (account_id).
   * - If inserting: sets created_at/updated_at to now.
   * - If updating: preserves created_at, bumps updated_at to now.
   *
   * Note: (name, account_type_id) is UNIQUE; same name is allowed across types.
   */
  upsert(input: AccountUpsertInput): Account {
    const id = input.accountId?.trim() ? input.accountId : newId();
    const ts = nowIso();
    const name = String(input.name ?? "").trim();
    const accountTypeId = String(input.accountTypeId ?? "").trim();

    const existingByNameAndType = this.db
      .prepare(
        `
        SELECT account_id
        FROM accounts
        WHERE name = ? AND account_type_id = ?
      `
      )
      .get(name, accountTypeId) as { account_id: string } | undefined;

    if (existingByNameAndType && existingByNameAndType.account_id !== id) {
      throw new Error(
        `Account already exists with name "${name}" for this account type. Use a different name or type.`
      );
    }

    try {
      this.db
        .prepare(
          `
          INSERT INTO accounts (
            account_id, name, account_type_id, default_currency_code,
            description, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(account_id) DO UPDATE SET
            name                  = excluded.name,
            account_type_id       = excluded.account_type_id,
            default_currency_code = excluded.default_currency_code,
            description           = excluded.description,
            updated_at            = excluded.updated_at
        `
        )
        .run(
          id,
          name,
          accountTypeId,
          input.defaultCurrencyCode,
          input.description ?? null,
          ts,
          ts
        );
    } catch (e: any) {
      if (
        e?.code === "SQLITE_CONSTRAINT_UNIQUE" &&
        String(e?.message ?? "").includes("accounts.name") &&
        String(e?.message ?? "").includes("accounts.account_type_id")
      ) {
        throw new Error(
          `Account already exists with name "${name}" for this account type. Use a different name or type.`
        );
      }

      if (
        e?.code === "SQLITE_CONSTRAINT_UNIQUE" &&
        String(e?.message ?? "").includes("accounts.name")
      ) {
        throw new Error(
          `Your database still enforces unique account names globally. Recreate DB so uniqueness is by (name, account_type_id).`
        );
      }
      throw e;
    }

    return this.getById(id)!;
  }

  delete(accountId: string): void {
    const result = this.db.prepare(`DELETE FROM accounts WHERE account_id = ?`).run(accountId);
    assertChanges(result, `Account not found (delete): ${accountId}`);
  }
}
