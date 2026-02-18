// main/db/repos/budgets.repo.ts
import Database from "better-sqlite3";
import type { Budget, BudgetUpsertInput } from "../../../shared/types/budget";
import { mapBudget, type DbBudgetRow } from "../mappers/budgets.mapper";
import { nowIso, newId } from "../mappers/common";

export class BudgetsRepo {
  constructor(private db: Database.Database) {}

  private ensureIncomeMonthExists(incomeMonthKey: string, ts: string) {
    // Assumes table name: income_month (income_month_key PK)
    // Creates the row if missing; if present, clears posting target because this
    // month is now linked to a budget.
    const existing = this.db
      .prepare(
        `
        SELECT created_at
        FROM income_month
        WHERE income_month_key = ?
      `
      )
      .get(incomeMonthKey) as { created_at: string } | undefined;

    const createdAt = existing?.created_at ?? ts;

    this.db
      .prepare(
        `
        INSERT INTO income_month (
          income_month_key,
          income_fund_id,
          income_asset_id,
          created_at,
          updated_at
        ) VALUES (?, NULL, NULL, ?, ?)
        ON CONFLICT(income_month_key) DO UPDATE SET
          income_fund_id = NULL,
          income_asset_id = NULL,
          updated_at = excluded.updated_at
      `
      )
      .run(incomeMonthKey, createdAt, ts);
  }

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
          surplus_handled,
          leftovers_handled,
          spending_fund_id,
          spending_asset_id,
          overage_fund_id,
          overage_asset_id,
          created_at,
          updated_at
        FROM budgets
        WHERE budget_month_key = ?
      `
      )
      .get(budgetMonthKey) as DbBudgetRow | undefined;

    return row ? mapBudget(row) : null;
  }

  getById(budgetId: string): Budget | null {
    const row = this.db
      .prepare(
        `
        SELECT
          budget_id,
          income_month_key,
          budget_month_key,
          cap,
          notes,
          surplus_handled,
          leftovers_handled,
          spending_fund_id,
          spending_asset_id,
          overage_fund_id,
          overage_asset_id,
          created_at,
          updated_at
        FROM budgets
        WHERE budget_id = ?
      `
      )
      .get(budgetId) as DbBudgetRow | undefined;

    return row ? mapBudget(row) : null;
  }

  /**
   * Upsert by primary key (budget_id).
   * budget_month_key is UNIQUE; if you try to upsert a different budget_id
   * with the same budget_month_key, SQLite will throw (good).
   *
   * Also ensures the referenced income_month exists before writing.
   *
   * Insert: created_at/updated_at set to now.
   * Update: preserves created_at, bumps updated_at.
   */
  upsert(input: BudgetUpsertInput): Budget {
    const id = input.budgetId?.trim() ? input.budgetId : newId();
    const ts = nowIso();

    const getCreatedAt = this.db.prepare(`
      SELECT
        created_at,
        surplus_handled,
        leftovers_handled,
        spending_fund_id,
        spending_asset_id,
        overage_fund_id,
        overage_asset_id
      FROM budgets
      WHERE budget_id = ?
    `);

    const existing = getCreatedAt.get(id) as {
      created_at: string;
      surplus_handled: 0 | 1;
      leftovers_handled: 0 | 1;
      spending_fund_id: string | null;
      spending_asset_id: string | null;
      overage_fund_id: string | null;
      overage_asset_id: string | null;
    } | undefined;
    const createdAt = existing?.created_at ?? ts;

    const surplusHandled =
      typeof input.surplusHandled === "boolean"
        ? input.surplusHandled
          ? 1
          : 0
        : existing?.surplus_handled ?? 0;

    const leftoversHandled =
      typeof input.leftoversHandled === "boolean"
        ? input.leftoversHandled
          ? 1
          : 0
        : existing?.leftovers_handled ?? 0;

    const overageFundId =
      input.overageFundId !== undefined
        ? String(input.overageFundId ?? "").trim() || null
        : existing?.overage_fund_id ?? null;

    const overageAssetId =
      input.overageAssetId !== undefined
        ? String(input.overageAssetId ?? "").trim() || null
        : existing?.overage_asset_id ?? null;

    const spendingFundId =
      input.spendingFundId !== undefined
        ? String(input.spendingFundId ?? "").trim() || null
        : existing?.spending_fund_id ?? null;

    const spendingAssetId =
      input.spendingAssetId !== undefined
        ? String(input.spendingAssetId ?? "").trim() || null
        : existing?.spending_asset_id ?? null;

    // Ensure FK target exists first (keeps repo robust even if caller forgets)
    this.ensureIncomeMonthExists(input.incomeMonthKey, ts);

    this.db
      .prepare(
        `
        INSERT INTO budgets (
          budget_id,
          income_month_key,
          budget_month_key,
          cap,
          notes,
          surplus_handled,
          leftovers_handled,
          spending_fund_id,
          spending_asset_id,
          overage_fund_id,
          overage_asset_id,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(budget_id) DO UPDATE SET
          income_month_key = excluded.income_month_key,
          budget_month_key = excluded.budget_month_key,
          cap              = excluded.cap,
          notes            = excluded.notes,
          surplus_handled  = excluded.surplus_handled,
          leftovers_handled = excluded.leftovers_handled,
          spending_fund_id = excluded.spending_fund_id,
          spending_asset_id = excluded.spending_asset_id,
          overage_fund_id  = excluded.overage_fund_id,
          overage_asset_id = excluded.overage_asset_id,
          updated_at       = excluded.updated_at
      `
      )
      .run(
        id,
        input.incomeMonthKey,
        input.budgetMonthKey,
        input.cap,
        input.notes ?? null,
        surplusHandled,
        leftoversHandled,
        spendingFundId,
        spendingAssetId,
        overageFundId,
        overageAssetId,
        createdAt,
        ts
      );

    return this.getByMonth(input.budgetMonthKey)!;
  }

  list(): Budget[] {
    const rows = this.db
      .prepare(
        `
        SELECT
          budget_id, income_month_key, budget_month_key, cap,
          notes,
          surplus_handled,
          leftovers_handled,
          spending_fund_id,
          spending_asset_id,
          overage_fund_id,
          overage_asset_id,
          created_at, updated_at
        FROM budgets
        ORDER BY budget_month_key COLLATE NOCASE
      `
      )
      .all() as DbBudgetRow[];
    return rows.map(mapBudget);
  }
}
