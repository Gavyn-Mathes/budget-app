// main/db/repos/account_types.repo.ts
import Database from "better-sqlite3";
import type { AccountType } from "../../../shared/types/account_type";
import { mapAccountType, type DbAccountTypeRow } from "../mappers/account_types.mapper";
import { nowIso, assertChanges, newId } from "../mappers/common";

export class AccountTypesRepo {
  constructor(private db: Database.Database) {}

  list(): AccountType[] {
    const rows = this.db
      .prepare(
        `
        SELECT account_type_id, account_type, created_at, updated_at
        FROM account_types
        ORDER BY account_type COLLATE NOCASE
      `
      )
      .all() as DbAccountTypeRow[];

    return rows.map(mapAccountType);
  }

  getById(accountTypeId: string): AccountType | null {
    const row = this.db
      .prepare(
        `
        SELECT account_type_id, account_type, created_at, updated_at
        FROM account_types
        WHERE account_type_id = ?
      `
      )
      .get(accountTypeId) as DbAccountTypeRow | undefined;

    return row ? mapAccountType(row) : null;
  }

  /**
   * Upsert by primary key (account_type_id).
   * - If inserting: sets created_at/updated_at to now.
   * - If updating: preserves created_at, bumps updated_at to now.
   */
  upsert(input: AccountType): AccountType {
    const id = input.accountTypeId?.trim() ? input.accountTypeId : newId();
    const ts = nowIso();

    const stmt = this.db.prepare(`
      INSERT INTO account_types (account_type_id, account_type, created_at, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(account_type_id) DO UPDATE SET
        account_type = excluded.account_type,
        updated_at   = excluded.updated_at
    `);

    const result = stmt.run(id, input.accountType, ts, ts);
    // NOTE: on conflict, sqlite changes can be 0 if values are identical.
    // We still treat that as success, so only assert for insert path.
    if (result.changes < 0) throw new Error("Unexpected upsert result");

    return this.getById(id)!;
  }

  delete(accountTypeId: string): void {
    const result = this.db
      .prepare(`DELETE FROM account_types WHERE account_type_id = ?`)
      .run(accountTypeId);

    assertChanges(result, `AccountType not found (delete): ${accountTypeId}`);
  }
}
