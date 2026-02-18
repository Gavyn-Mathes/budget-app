// main/db/repos/incomes.repo.ts
import Database from "better-sqlite3";
import type {
  Income,
  IncomeMonth,
  IncomeMonthUpsertInput,
  IncomeUpsertInput,
} from "../../../shared/types/income";
import {
  mapIncome,
  mapIncomeMonth,
  type DbIncomeMonthRow,
  type DbIncomeRow,
} from "../mappers/incomes.mapper";
import { nowIso, newId, assertChanges } from "../mappers/common";

export class IncomeRepo {
  constructor(private db: Database.Database) {}

  getLinkedBudgetMonthKey(incomeMonthKey: string): string | null {
    const row = this.db
      .prepare(
        `
        SELECT budget_month_key
        FROM budgets
        WHERE income_month_key = ?
        ORDER BY budget_month_key
        LIMIT 1
      `
      )
      .get(incomeMonthKey) as { budget_month_key: string } | undefined;

    return row?.budget_month_key ?? null;
  }

  listByMonth(incomeMonthKey: string): Income[] {
    const rows = this.db
      .prepare(
        `
        SELECT
          income_id, income_month_key, fund_event_id, name, date, amount, notes,
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
          income_id, income_month_key, fund_event_id, name, date, amount, notes,
          created_at, updated_at
        FROM income
        WHERE income_id = ?
      `
      )
      .get(incomeId) as DbIncomeRow | undefined;

    return row ? mapIncome(row) : null;
  }

  getLinkedFundEventId(incomeId: string): string | null {
    const row = this.db
      .prepare(
        `
        SELECT fund_event_id
        FROM income
        WHERE income_id = ?
      `
      )
      .get(incomeId) as { fund_event_id: string | null } | undefined;

    return row?.fund_event_id ?? null;
  }

  getMonth(incomeMonthKey: string): IncomeMonth | null {
    const row = this.db
      .prepare(
        `
        SELECT
          income_month_key,
          income_fund_id,
          income_asset_id,
          created_at,
          updated_at
        FROM income_month
        WHERE income_month_key = ?
      `
      )
      .get(incomeMonthKey) as DbIncomeMonthRow | undefined;

    return row ? mapIncomeMonth(row) : null;
  }

  upsertMonth(input: IncomeMonthUpsertInput): IncomeMonth {
    const ts = nowIso();
    const existing = this.getMonth(input.incomeMonthKey);
    const createdAt = existing?.createdAt ?? ts;
    const linkedBudgetMonthKey = this.getLinkedBudgetMonthKey(input.incomeMonthKey);

    const incomeFundId =
      input.incomeFundId !== undefined
        ? String(input.incomeFundId ?? "").trim() || null
        : existing?.incomeFundId ?? null;

    const incomeAssetId =
      input.incomeAssetId !== undefined
        ? String(input.incomeAssetId ?? "").trim() || null
        : existing?.incomeAssetId ?? null;

    // If this income month is consumed by a budget, posting target lives outside income_month.
    const persistedIncomeFundId = linkedBudgetMonthKey ? null : incomeFundId;
    const persistedIncomeAssetId = linkedBudgetMonthKey ? null : incomeAssetId;

    this.db
      .prepare(
        `
        INSERT INTO income_month (
          income_month_key,
          income_fund_id,
          income_asset_id,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(income_month_key) DO UPDATE SET
          income_fund_id = excluded.income_fund_id,
          income_asset_id = excluded.income_asset_id,
          updated_at = excluded.updated_at
      `
      )
      .run(
        input.incomeMonthKey,
        persistedIncomeFundId,
        persistedIncomeAssetId,
        createdAt,
        ts
      );

    return this.getMonth(input.incomeMonthKey)!;
  }

  ensureIncomeMonthExists(incomeMonthKey: string): void {
    this.ensureIncomeMonth(incomeMonthKey, nowIso());
  }

  private ensureIncomeMonth(incomeMonthKey: string, ts: string) {
    this.db
      .prepare(
        `
        INSERT OR IGNORE INTO income_month (
          income_month_key, income_fund_id, income_asset_id, created_at, updated_at
        ) VALUES (?, NULL, NULL, ?, ?)
      `
      )
      .run(incomeMonthKey, ts, ts);

    this.db
      .prepare(
        `
        UPDATE income_month
        SET updated_at = ?
        WHERE income_month_key = ?
      `
      )
      .run(ts, incomeMonthKey);
  }


  upsert(input: IncomeUpsertInput, fundEventId?: string | null): Income {
    const id = input.incomeId?.trim() ? input.incomeId : newId();
    const ts = nowIso();

    this.ensureIncomeMonth(input.incomeMonthKey, ts);

    const existing = this.db
      .prepare(`SELECT created_at, fund_event_id FROM income WHERE income_id = ?`)
      .get(id) as { created_at: string; fund_event_id: string | null } | undefined;

    const createdAt = existing?.created_at ?? ts;
    const linkedFundEventId =
      fundEventId === undefined ? existing?.fund_event_id ?? null : fundEventId;

    this.db
      .prepare(
        `
        INSERT INTO income (
          income_id, income_month_key, fund_event_id, name, date, amount, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(income_id) DO UPDATE SET
          income_month_key = excluded.income_month_key,
          fund_event_id    = excluded.fund_event_id,
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
        linkedFundEventId,
        input.name,
        input.date,
        input.amount,
        input.notes ?? null,
        createdAt,
        ts
      );

    this.db
      .prepare(
        `
        UPDATE income_month
        SET updated_at = ?
        WHERE income_month_key = ?
      `
      )
      .run(ts, input.incomeMonthKey);

    return this.getById(id)!;
  }

  delete(incomeId: string): void {
    const result = this.db
      .prepare(`DELETE FROM income WHERE income_id = ?`)
      .run(incomeId);
    assertChanges(result, `Income not found (delete): ${incomeId}`);
  }
}
