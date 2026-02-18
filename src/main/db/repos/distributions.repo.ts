// main/db/repos/distributions.repo.ts
import Database from "better-sqlite3";
import type { DistributionRule, DistributionRuleUpsertInput } from "../../../shared/types/distribution";
import { mapDistributionRule, type DbDistributionRow } from "../mappers/distributions.mapper";
import { nowIso, newId } from "../mappers/common";

export class DistributionRepo {
  constructor(private db: Database.Database) {}

  listByBudget(budgetId: string): DistributionRule[] {
    const rows = this.db
      .prepare(
        `
        SELECT
          distribution_rule_id, budget_id,
          source_type, category_id,
          fund_id, asset_id,
          allocation_type, fixed_amount, percent,
          created_at, updated_at
        FROM distribution
        WHERE budget_id = ?
        ORDER BY distribution_rule_id
      `
      )
      .all(budgetId) as DbDistributionRow[];

    return rows.map(mapDistributionRule);
  }

  getById(distributionRuleId: string): DistributionRule | null {
    const row = this.db
      .prepare(
        `
        SELECT
          distribution_rule_id, budget_id,
          source_type, category_id,
          fund_id, asset_id,
          allocation_type, fixed_amount, percent,
          created_at, updated_at
        FROM distribution
        WHERE distribution_rule_id = ?
      `
      )
      .get(distributionRuleId) as DbDistributionRow | undefined;

    return row ? mapDistributionRule(row) : null;
  }

  /**
   * UpsertMany for a given budget.
   * - Ensures every rule.budgetId matches the input budgetId.
   * - Inserts missing rules (created_at/updated_at = now).
   * - Updates existing rules (preserves created_at, bumps updated_at).
   *
   * Note: This does NOT delete rules that are omitted from the list.
   * If you want "replace all", tell me and I'll add a delete-not-in step.
   */
  upsertMany(budgetId: string, rules: DistributionRuleUpsertInput[]): void {
  const selectCreatedAt = this.db.prepare(`
    SELECT created_at
    FROM distribution
    WHERE distribution_rule_id = ?
  `);

  const upsert = this.db.prepare(`
    INSERT INTO distribution (
      distribution_rule_id,
      budget_id,
      source_type,
      category_id,
      fund_id,
      asset_id,
      allocation_type,
      fixed_amount,
      percent,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(distribution_rule_id) DO UPDATE SET
      budget_id        = excluded.budget_id,
      source_type      = excluded.source_type,
      category_id      = excluded.category_id,
      fund_id          = excluded.fund_id,
      asset_id         = excluded.asset_id,
      allocation_type  = excluded.allocation_type,
      fixed_amount     = excluded.fixed_amount,
      percent          = excluded.percent,
      updated_at       = excluded.updated_at
  `);

  const ts = nowIso();

  for (const r of rules) {
    if (r.budgetId !== budgetId) {
      throw new Error(
        `DistributionRepo.upsertMany: rule.budgetId (${r.budgetId}) does not match budgetId (${budgetId})`
      );
    }

    const id = r.distributionRuleId?.trim() ? r.distributionRuleId : newId();
    const existing = selectCreatedAt.get(id) as { created_at: string } | undefined;
    const createdAt = existing?.created_at ?? ts;

    const sourceType = r.sourceType;
    const categoryId = sourceType === "CATEGORY" ? r.categoryId : null;

    const allocationType = r.allocationType;
    const fixedAmount = allocationType === "FIXED" ? r.fixedAmount : null;
    const percent = allocationType === "PERCENT" ? r.percent : null;
    const assetId = r.assetId ?? null;

    upsert.run(
      id,
      budgetId,
      sourceType,
      categoryId,
      r.fundId,
      assetId,
      allocationType,
      fixedAmount,
      percent,
      createdAt,
      ts
    );
  }
}


  deleteOne(distributionRuleId: string): void {
    // Matches your IPC "ok: true" expectation even if already deleted.
    this.db.prepare(`DELETE FROM distribution WHERE distribution_rule_id = ?`).run(distributionRuleId);
  }
}
