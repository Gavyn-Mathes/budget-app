// main/db/repos/transactions.repo.ts
import Database from "better-sqlite3";
import type { Transaction, TransactionUpsertInput } from "../../../shared/types/transaction";
import { mapTransaction, type DbTransactionRow } from "../mappers/transactions.mapper";
import { nowIso, newId, assertChanges } from "../mappers/common";
import { monthToRange } from "../../../shared/domain/month";

export class TransactionsRepo {
  constructor(private db: Database.Database) {}

  listByMonth(monthKey: string): Transaction[] {
    const { start, endExclusive } = monthToRange(monthKey);

    const rows = this.db
      .prepare(
        `
        SELECT
          transaction_id, category_id, fund_event_id, date, amount, notes,
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
          transaction_id, category_id, fund_event_id, date, amount, notes,
          created_at, updated_at
        FROM transactions
        WHERE transaction_id = ?
      `
      )
      .get(transactionId) as DbTransactionRow | undefined;

    return row ? mapTransaction(row) : null;
  }

  getLinkedFundEventId(transactionId: string): string | null {
    const row = this.db
      .prepare(
        `
        SELECT fund_event_id
        FROM transactions
        WHERE transaction_id = ?
      `
      )
      .get(transactionId) as { fund_event_id: string | null } | undefined;

    return row?.fund_event_id ?? null;
  }

  /**
   * Upsert by primary key (transaction_id).
   * - Insert: created_at/updated_at = now
   * - Update: preserve created_at, bump updated_at
   * - fundEventId behavior:
   *   - undefined -> preserve current linked fund_event_id
   *   - null|string -> set linked fund_event_id explicitly
   */
  upsert(input: TransactionUpsertInput, fundEventId?: string | null): Transaction {
    const id = input.transactionId?.trim() ? input.transactionId : newId();
    const ts = nowIso();

    const existing = this.db
      .prepare(`SELECT created_at, fund_event_id FROM transactions WHERE transaction_id = ?`)
      .get(id) as { created_at: string; fund_event_id: string | null } | undefined;

    const createdAt = existing?.created_at ?? ts;
    const linkedFundEventId =
      fundEventId === undefined ? (existing?.fund_event_id ?? null) : fundEventId;

    this.db
      .prepare(
        `
        INSERT INTO transactions (
          transaction_id, category_id, fund_event_id, date, amount, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(transaction_id) DO UPDATE SET
          category_id   = excluded.category_id,
          fund_event_id = excluded.fund_event_id,
          date          = excluded.date,
          amount        = excluded.amount,
          notes         = excluded.notes,
          updated_at    = excluded.updated_at
      `
      )
      .run(
        id,
        input.categoryId,
        linkedFundEventId,
        input.date,
        input.amount,
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
