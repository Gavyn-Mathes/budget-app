// main/db/repos/accounts.repo.ts
import Database from "better-sqlite3";
import type { Account } from "../../../shared/types/account";
import { mapAccount, type DbAccountRow } from "../mappers/accounts.mapper";
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
   * Note: name is UNIQUE; attempting to set a name that already exists on another
   * row will throw from SQLite (as desired).
   */
  upsert(input: Account): Account {
    const id = input.accountId?.trim() ? input.accountId : newId();
    const ts = nowIso();

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
        input.name,
        input.accountTypeId,
        input.defaultCurrencyCode,
        input.description ?? null,
        ts,
        ts
      );

    return this.getById(id)!;
  }

  delete(accountId: string): void {
    const result = this.db.prepare(`DELETE FROM accounts WHERE account_id = ?`).run(accountId);
    assertChanges(result, `Account not found (delete): ${accountId}`);
  }
}
