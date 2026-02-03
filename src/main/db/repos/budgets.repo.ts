// main/db/repos/budgets.repo.ts
import Database from "better-sqlite3";
import type { Budget } from "../../../shared/types/budget";
import { mapBudget, type DbBudgetRow } from "../mappers/budgets.mapper";
import { nowIso, newId } from "../mappers/common";

export class BudgetsRepo {
  constructor(private db: Database.Database) {}

  getByMonth(budgetMonthKey: string): Budget | null {
    const row = this.db
      .prepare(
        `
        SELECT
          budget_id,
          income_month_key,
          budget_month_key,
          cap,
          notes,
          created_at,
          updated_at
        FROM budgets
        WHERE budget_month_key = ?
      `
      )
      .get(budgetMonthKey) as DbBudgetRow | undefined;

    return row ? mapBudget(row) : null;
  }

  /**
   * Upsert by primary key (budget_id).
   * budget_month_key is UNIQUE; if you try to upsert a different budget_id
   * with the same budget_month_key, SQLite will throw (good).
   *
   * Insert: created_at/updated_at set to now.
   * Update: preserves created_at, bumps updated_at.
   */
  upsert(input: Budget): Budget {
    const id = input.budgetId?.trim() ? input.budgetId : newId();
    const ts = nowIso();

    const getCreatedAt = this.db.prepare(`
      SELECT created_at
      FROM budgets
      WHERE budget_id = ?
    `);

    const existing = getCreatedAt.get(id) as { created_at: string } | undefined;
    const createdAt = existing?.created_at ?? ts;

    this.db
      .prepare(
        `
        INSERT INTO budgets (
          budget_id,
          income_month_key,
          budget_month_key,
          cap,
          notes,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(budget_id) DO UPDATE SET
          income_month_key = excluded.income_month_key,
          budget_month_key = excluded.budget_month_key,
          cap              = excluded.cap,
          notes            = excluded.notes,
          updated_at       = excluded.updated_at
      `
      )
      .run(
        id,
        input.incomeMonthKey,
        input.budgetMonthKey,
        input.cap as any as number,
        input.notes ?? null,
        createdAt,
        ts
      );

    // IPC wants lookup by month, and budget_month_key is UNIQUE:
    return this.getByMonth(input.budgetMonthKey)!;
  }
}
