// src/main/services/distributions.service.ts

import type Database from "better-sqlite3";
import type {
  DistributionRule,
  DistributionRuleUpsertInput,
} from "../../shared/types/distribution";
import { withTx } from "./common";
import { DistributionRepo } from "../db/repos/distributions.repo";

export class DistributionsService {
  constructor(
    private readonly db: Database.Database,
    private readonly repo: DistributionRepo
  ) {}

  listByBudget(budgetId: string): DistributionRule[] {
    return this.repo.listByBudget(budgetId);
  }

  // expects req like { budgetId, rules }
  upsertMany(req: { budgetId: string; rules: DistributionRuleUpsertInput[] }): void {
    return withTx(this.db, () => {
      const existing = this.repo.listByBudget(req.budgetId);
      const merged = new Map<string, DistributionRule | DistributionRuleUpsertInput>();
      for (const rule of existing) {
        merged.set(rule.distributionRuleId, rule);
      }

      for (let i = 0; i < req.rules.length; i++) {
        const incoming = req.rules[i];
        const ruleId = String((incoming as any).distributionRuleId ?? "").trim();
        const key = ruleId || `__new_${i}`;
        merged.set(key, incoming);
      }

      for (const [key, rule] of merged.entries()) {
        if (rule.sourceType === "CATEGORY" && rule.allocationType !== "PERCENT") {
          throw new Error(
            `CATEGORY distribution rules must use PERCENT allocation (rule=${key}).`
          );
        }
      }

      // Per-category percentages cannot exceed 100%.
      const percentByCategory = new Map<string, number>();
      let surplusPercentTotal = 0;
      for (const rule of merged.values()) {
        if (rule.allocationType !== "PERCENT") continue;

        if (rule.sourceType === "SURPLUS") {
          surplusPercentTotal += Number(rule.percent ?? 0);
          continue;
        }

        const categoryId = String(rule.categoryId ?? "").trim();
        if (!categoryId) continue;
        const next = (percentByCategory.get(categoryId) ?? 0) + Number(rule.percent ?? 0);
        percentByCategory.set(categoryId, next);
      }

      for (const [categoryId, totalPercent] of percentByCategory.entries()) {
        if (totalPercent > 1 + 1e-9) {
          throw new Error(
            `Distribution percentages exceed 100% for category ${categoryId}.`
          );
        }
      }

      if (surplusPercentTotal > 1 + 1e-9) {
        throw new Error("Distribution percentages exceed 100% for surplus.");
      }

      this.repo.upsertMany(req.budgetId, req.rules);
    });
  }

  deleteOne(distributionRuleId: string): void {
    return withTx(this.db, () => this.repo.deleteOne(distributionRuleId));
  }
}
