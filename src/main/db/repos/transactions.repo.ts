// main/db/repos/transactions.repo.ts
import Database from "better-sqlite3";
import type { Transaction } from "../../../shared/types/transaction";
import { mapTransaction, type DbTransactionRow } from "../mappers/transactions.mapper";
import { nowIso, newId, assertChanges } from "../mappers/common";

function monthToRange(monthKey: string): { start: string; endExclusive: string } {
  // monthKey: "YYYY-MM"
  const [yStr, mStr] = monthKey.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
    throw new Error(`Invalid monthKey: ${monthKey}`);
  }
  const start = `${yStr}-${mStr}-01`;

  // compute next month
  let ny = y;
  let nm = m + 1;
  if (nm === 13) {
    nm = 1;
    ny = y + 1;
  }
  const nmStr = String(nm).padStart(2, "0");
  const endExclusive = `${String(ny)}-${nmStr}-01`;
  return { start, endExclusive };
}

export class TransactionsRepo {
  constructor(private db: Database.Database) {}

  listByMonth(monthKey: string): Transaction[] {
    const { start, endExclusive } = monthToRange(monthKey);

    // Use < endExclusive so datetime strings also work.
    const rows = this.db
      .prepare(
        `
        SELECT
          transaction_id, category_id, date, amount, notes,
          created_at, updated_at
        FROM transactions
        WHERE date >= ? AND date < ?
        ORDER BY date, transaction_id
      `
      )
      .all(start, endExclusive) as DbTransactionRow[];

    return rows.map(mapTransaction);
  }

  getById(transactionId: string): Transaction | null {
    const row = this.db
      .prepare(
        `
        SELECT
          transaction_id, category_id, date, amount, notes,
          created_at, updated_at
        FROM transactions
        WHERE transaction_id = ?
      `
      )
      .get(transactionId) as DbTransactionRow | undefined;

    return row ? mapTransaction(row) : null;
  }

  /**
   * Upsert by primary key (transaction_id).
   * - Insert: created_at/updated_at = now
   * - Update: preserve created_at, bump updated_at
   */
  upsert(input: Transaction): Transaction {
    const id = input.transactionId?.trim() ? input.transactionId : newId();
    const ts = nowIso();

    const existing = this.db
      .prepare(`SELECT created_at FROM transactions WHERE transaction_id = ?`)
      .get(id) as { created_at: string } | undefined;

    const createdAt = existing?.created_at ?? ts;

    this.db
      .prepare(
        `
        INSERT INTO transactions (
          transaction_id, category_id, date, amount, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(transaction_id) DO UPDATE SET
          category_id = excluded.category_id,
          date        = excluded.date,
          amount      = excluded.amount,
          notes       = excluded.notes,
          updated_at  = excluded.updated_at
      `
      )
      .run(
        id,
        input.categoryId,
        input.date,
        input.amount as any as number,
        input.notes ?? null,
        createdAt,
        ts
      );

    return this.getById(id)!;
  }

  delete(transactionId: string): void {
    const result = this.db.prepare(`DELETE FROM transactions WHERE transaction_id = ?`).run(transactionId);
    assertChanges(result, `Transaction not found (delete): ${transactionId}`);
  }
}
