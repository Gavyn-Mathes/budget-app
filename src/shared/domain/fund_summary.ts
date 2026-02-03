// shared/domain/fund_summary.ts
import type { FundId } from "../types/fund";
import type { Liability } from "../types/liability";

export function liabilityTotalForFund(fundId: FundId, liabilities: Liability[]): number {
  const total = liabilities
    .filter(l => l.fundId === fundId && l.isActive)
    .reduce((sum, l) => sum + l.currentBalance, 0);

  return Math.round(total * 100) / 100;
}
