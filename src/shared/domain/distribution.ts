// shared/domain/distribution.ts
import type { DistributionRule } from "../types/distribution";

export function distributionPlannedAmount(rule: DistributionRule, baseAmount: number): number {
  const base = Number.isFinite(baseAmount) ? baseAmount : 0;

  if (rule.allocationType === "FIXED") {
    return roundCents(rule.fixedAmount);
  }

  // allocationType === "PERCENT"
  return roundCents(rule.percent * base);
}

export function distributionDirection(rule: DistributionRule) {
  return rule.sourceType === "CATEGORY"
    ? { from: { kind: "CATEGORY" as const, id: rule.categoryId }, to: { kind: "FUND" as const, id: rule.fundId } }
    : { from: { kind: "FUND" as const, id: rule.fundId }, to: { kind: "CATEGORY" as const, id: rule.categoryId } };
}

export function roundCents(n: number): number {
  return Math.round(n * 100) / 100;
}
