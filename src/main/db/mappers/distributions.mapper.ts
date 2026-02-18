// main/db/mappers/distributions.mapper.ts
import type { DistributionRule } from "../../../shared/types/distribution";

export type DbDistributionRow = {
  distribution_rule_id: string;
  budget_id: string;

  source_type: "SURPLUS" | "CATEGORY";
  category_id: string | null;

  fund_id: string;
  asset_id: string | null;

  allocation_type: "FIXED" | "PERCENT";
  fixed_amount: number | null;
  percent: number | null;

  created_at: string;
  updated_at: string;
};

export function mapDistributionRule(row: DbDistributionRow): DistributionRule {
  const common = {
    distributionRuleId: row.distribution_rule_id,
    budgetId: row.budget_id,
    fundId: row.fund_id,
    assetId: row.asset_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as const;

  const source =
    row.source_type === "SURPLUS"
      ? ({ sourceType: "SURPLUS", categoryId: null } as const)
      : (() => {
          if (!row.category_id) {
            throw new Error(`Missing category_id for CATEGORY distribution_rule_id=${row.distribution_rule_id}`);
          }
          return { sourceType: "CATEGORY", categoryId: row.category_id } as const;
        })();

  const allocation =
    row.allocation_type === "FIXED"
      ? (() => {
          if (row.fixed_amount === null || row.percent !== null) {
            throw new Error(`Invalid FIXED allocation for distribution_rule_id=${row.distribution_rule_id}`);
          }
          return { allocationType: "FIXED", fixedAmount: row.fixed_amount, percent: null } as const;
        })()
      : (() => {
          if (row.percent === null || row.fixed_amount !== null) {
            throw new Error(`Invalid PERCENT allocation for distribution_rule_id=${row.distribution_rule_id}`);
          }
          return { allocationType: "PERCENT", fixedAmount: null, percent: row.percent } as const;
        })();

  return {
    ...common,
    ...source,
    ...allocation,
  } as DistributionRule;
}
