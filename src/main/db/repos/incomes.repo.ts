// main/db/repos/income.repo.ts
import Database from "better-sqlite3";
import type { Income } from "../../../shared/types/income";
import { mapIncome, type DbIncomeRow } from "../mappers/incomes.mapper";
import { nowIso, newId, assertChanges } from "../mappers/common";

export class IncomeRepo {
  constructor(private db: Database.Database) {}

  listByMonth(incomeMonthKey: string): Income[] {
    const rows = this.db
      .prepare(
        `
        SELECT
          income_id, income_month_key, name, date, amount, notes,
          created_at, updated_at
        FROM income
        WHERE income_month_key = ?
        ORDER BY date, name COLLATE NOCASE, income_id
      `
      )
      .all(incomeMonthKey) as DbIncomeRow[];

    return rows.map(mapIncome);
  }

  getById(incomeId: string): Income | null {
    const row = this.db
      .prepare(
        `
        SELECT
          income_id, income_month_key, name, date, amount, notes,
          created_at, updated_at
        FROM income
        WHERE income_id = ?
      `
      )
      .get(incomeId) as DbIncomeRow | undefined;

    return row ? mapIncome(row) : null;
  }

  /**
   * Upsert by primary key (income_id).
   * - Insert: created_at/updated_at = now
   * - Update: preserve created_at, bump updated_at
   */
  upsert(input: Income): Income {
    const id = input.incomeId?.trim() ? input.incomeId : newId();
    const ts = nowIso();

    const existing = this.db
      .prepare(`SELECT created_at FROM income WHERE income_id = ?`)
      .get(id) as { created_at: string } | undefined;

    const createdAt = existing?.created_at ?? ts;

    this.db
      .prepare(
        `
        INSERT INTO income (
          income_id, income_month_key, name, date, amount, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(income_id) DO UPDATE SET
          income_month_key = excluded.income_month_key,
          name             = excluded.name,
          date             = excluded.date,
          amount           = excluded.amount,
          notes            = excluded.notes,
          updated_at       = excluded.updated_at
      `
      )
      .run(
        id,
        input.incomeMonthKey,
        input.name,
        input.date,
        input.amount as any as number,
        input.notes ?? null,
        createdAt,
        ts
      );

    return this.getById(id)!;
  }

  delete(incomeId: string): void {
    const result = this.db.prepare(`DELETE FROM income WHERE income_id = ?`).run(incomeId);
    assertChanges(result, `Income not found (delete): ${incomeId}`);
  }
}
