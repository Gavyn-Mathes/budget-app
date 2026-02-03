// main/db/repos/budget_lines.repo.ts
import Database from "better-sqlite3";
import type { BudgetLine } from "../../../shared/types/budget_line";
import { mapBudgetLine, type DbBudgetLineRow } from "../mappers/budget_lines.mapper";
import { nowIso } from "../mappers/common";

export class BudgetLinesRepo {
  constructor(private db: Database.Database) {}

  listByBudget(budgetId: string): BudgetLine[] {
    const rows = this.db
      .prepare(
        `
        SELECT
          budget_id, category_id, allocation_type,
          fixed_amount, percent,
          created_at, updated_at
        FROM budget_lines
        WHERE budget_id = ?
        ORDER BY category_id
      `
      )
      .all(budgetId) as DbBudgetLineRow[];

    return rows.map(mapBudgetLine);
  }

  /**
   * UpsertMany semantics for a given budget:
   * - Upsert each provided line (composite PK: budget_id + category_id).
   * - If a line exists, preserve created_at and update updated_at.
   * - Ensures budgetId on every line matches the request budgetId.
   */
  upsertMany(budgetId: string, lines: BudgetLine[]): void {
    const getCreatedAt = this.db.prepare(`
      SELECT created_at
      FROM budget_lines
      WHERE budget_id = ? AND category_id = ?
    `);

    const upsert = this.db.prepare(`
      INSERT INTO budget_lines (
        budget_id, category_id, allocation_type,
        fixed_amount, percent,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(budget_id, category_id) DO UPDATE SET
        allocation_type = excluded.allocation_type,
        fixed_amount    = excluded.fixed_amount,
        percent         = excluded.percent,
        updated_at      = excluded.updated_at
    `);

    const tx = this.db.transaction(() => {
      const ts = nowIso();

      for (const line of lines) {
        if (line.budgetId !== budgetId) {
          throw new Error(
            `BudgetLinesRepo.upsertMany: line.budgetId (${line.budgetId}) does not match budgetId (${budgetId})`
          );
        }

        const existing = getCreatedAt.get(budgetId, line.categoryId) as { created_at: string } | undefined;
        const createdAt = existing?.created_at ?? ts;

        const fixedAmount =
          line.allocationType === "FIXED" ? (line.fixedAmount as any as number) : null;
        const percent =
          line.allocationType === "PERCENT" ? line.percent : null;

        upsert.run(
          budgetId,
          line.categoryId,
          line.allocationType,
          fixedAmount,
          percent,
          createdAt,
          ts
        );
      }
    });

    tx();
  }

  deleteOne(budgetId: string, categoryId: string): void {
    // Caller expects ok:true regardless? Your IPC says ok:true,
    // but we'll be strict by default: if not found, it's still "ok" in UI patterns.
    // If you want strict, change to throw when changes !== 1.
    this.db.prepare(`DELETE FROM budget_lines WHERE budget_id = ? AND category_id = ?`).run(budgetId, categoryId);
  }
}
