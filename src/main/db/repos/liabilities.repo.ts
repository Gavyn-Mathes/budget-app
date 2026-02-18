// main/db/repos/liabilities.repo.ts
import Database from "better-sqlite3";
import type { Liability, LiabilityUpsertInput, LiabilityWithBalance } from "../../../shared/types/liability";
import {
  mapLiability,
  mapLiabilityWithBalance,
  type DbLiabilityJoinedRow,
  type DbLiabilityWithBalanceJoinedRow,
} from "../mappers/liabilities.mapper";
import { nowIso, newId, assertChanges } from "../mappers/common";

type ExistingLiabilityRow = {
  liability_id: string;
  liability_type: "LOAN" | "CREDIT";
  created_at: string;
};

export class LiabilitiesRepo {
  constructor(private db: Database.Database) {}

  private joinedSelect = `
    SELECT
      l.liability_id, l.fund_id, l.account_id,
      l.liability_type,
      l.name, l.apr, 
      l.opened_date, l.created_at, l.updated_at, l.is_active, l.notes,

      ln.liability_id AS loan_liability_id,
      ln.original_principal, ln.maturity_date, ln.payment_amount, ln.payment_frequency,

      cr.liability_id AS credit_liability_id,
      cr.credit_limit, cr.due_day, cr.min_payment_type, cr.min_payment_value, cr.statement_day
    FROM liability l
    LEFT JOIN loans  ln ON ln.liability_id = l.liability_id
    LEFT JOIN credit cr ON cr.liability_id = l.liability_id
  `;

  list(): Liability[] {
    const rows = this.db
      .prepare(
        `
        ${this.joinedSelect}
        ORDER BY l.name COLLATE NOCASE, l.liability_id
      `
      )
      .all() as DbLiabilityJoinedRow[];

    return rows.map(mapLiability);
  }

  listWithBalances(): LiabilityWithBalance[] {
    const rows = this.db
      .prepare(
        `
        WITH liability_balances AS (
          SELECT
            liability_id,
            COALESCE(SUM(money_delta_minor), 0) AS money_balance_minor
          FROM fund_event_line
          WHERE liability_id IS NOT NULL
          GROUP BY liability_id
        )
        SELECT
          base.*,
          COALESCE(lb.money_balance_minor, 0) AS money_balance_minor
        FROM (
          ${this.joinedSelect}
        ) base
        LEFT JOIN liability_balances lb ON lb.liability_id = base.liability_id
        ORDER BY base.name COLLATE NOCASE, base.liability_id
      `
      )
      .all() as DbLiabilityWithBalanceJoinedRow[];

    return rows.map(mapLiabilityWithBalance);
  }

  listByFund(fundId: string): Liability[] {
    const rows = this.db
      .prepare(
        `
        ${this.joinedSelect}
        WHERE l.fund_id = ?
        ORDER BY l.name COLLATE NOCASE, l.liability_id
      `
      )
      .all(fundId) as DbLiabilityJoinedRow[];

    return rows.map(mapLiability);
  }

  getById(liabilityId: string): Liability | null {
    const row = this.db
      .prepare(
        `
        ${this.joinedSelect}
        WHERE l.liability_id = ?
      `
      )
      .get(liabilityId) as DbLiabilityJoinedRow | undefined;

    return row ? mapLiability(row) : null;
  }

  /**
   * Upsert by primary key (liability_id).
   * - Insert: created_at/updated_at = now, and creates subtype row.
   * - Update: preserves created_at, bumps updated_at.
   * - If liabilityType changes, deletes old subtype row and writes the new subtype.
   */
  upsert(input: LiabilityUpsertInput): Liability {
  const id = input.liabilityId?.trim() ? input.liabilityId : newId();
  const ts = nowIso();

  const getExisting = this.db.prepare(`
    SELECT liability_id, liability_type, created_at
    FROM liability
    WHERE liability_id = ?
  `);

  const insertBase = this.db.prepare(`
    INSERT INTO liability (
      liability_id, fund_id, account_id,
      liability_type, name, apr,
      opened_date, created_at, updated_at, is_active, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const updateBase = this.db.prepare(`
    UPDATE liability
    SET
      fund_id         = ?,
      account_id      = ?,
      liability_type  = ?,
      name            = ?,
      apr             = ?,
      opened_date     = ?,
      updated_at      = ?,
      is_active       = ?,
      notes           = ?
    WHERE liability_id = ?
  `);

  const delLoan = this.db.prepare(`DELETE FROM loans  WHERE liability_id = ?`);
  const delCredit = this.db.prepare(`DELETE FROM credit WHERE liability_id = ?`);

  const upsertLoan = this.db.prepare(`
    INSERT INTO loans (liability_id, original_principal, maturity_date, payment_amount, payment_frequency)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(liability_id) DO UPDATE SET
      original_principal = excluded.original_principal,
      maturity_date      = excluded.maturity_date,
      payment_amount     = excluded.payment_amount,
      payment_frequency  = excluded.payment_frequency
  `);

  const upsertCredit = this.db.prepare(`
    INSERT INTO credit (
      liability_id, credit_limit, due_day, min_payment_type, min_payment_value, statement_day
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(liability_id) DO UPDATE SET
      credit_limit      = excluded.credit_limit,
      due_day           = excluded.due_day,
      min_payment_type  = excluded.min_payment_type,
      min_payment_value = excluded.min_payment_value,
      statement_day     = excluded.statement_day
  `);

  const existing = getExisting.get(id) as ExistingLiabilityRow | undefined;
  const createdAt = existing?.created_at ?? ts;

  if (!existing) {
    const r = insertBase.run(
      id,
      input.fundId,
      input.accountId,
      input.liabilityType,
      input.name,
      input.apr ?? null,
      input.openedDate ?? null,
      createdAt,
      ts,
      input.isActive ? 1 : 0,
      input.notes ?? null
    );
    assertChanges(r, "Failed to insert liability");
  } else {
    if (existing.liability_type !== input.liabilityType) {
      delLoan.run(id);
      delCredit.run(id);
    }

    const r = updateBase.run(
      input.fundId,
      input.accountId,
      input.liabilityType,
      input.name,
      input.apr ?? null,
      input.openedDate ?? null,
      ts,
      input.isActive ? 1 : 0,
      input.notes ?? null,
      id
    );
    assertChanges(r, "Failed to update liability");
  }

  if (input.liabilityType === "LOAN") {
    upsertLoan.run(
      id,
      input.originalPrincipal === null ? null : (input.originalPrincipal as any as number),
      input.maturityDate ?? null,
      input.paymentAmount === null ? null : (input.paymentAmount as any as number),
      input.paymentFrequency ?? null
    );
  } else {
    const minType = input.minPaymentType ?? null;
    const minValue = minType === null ? null : input.minPaymentValue;

    upsertCredit.run(
      id,
      input.creditLimit === null ? null : (input.creditLimit as any as number),
      input.dueDay ?? null,
      minType,
      minValue ?? null,
      input.statementDay ?? null
    );
  }

  return this.getById(id)!;
}


  delete(liabilityId: string): void {
    // Will cascade to loans/credit; may fail if referenced with RESTRICT elsewhere.
    const result = this.db.prepare(`DELETE FROM liability WHERE liability_id = ?`).run(liabilityId);
    assertChanges(result, `Liability not found (delete): ${liabilityId}`);
  }
}
