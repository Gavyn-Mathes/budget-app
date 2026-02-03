// shared/types/distribution.ts
import type { Id, IsoTimestamp, Money } from "./common";
import type { BudgetId } from "./budget";
import type { CategoryId } from "./category";
import type { FundId } from "./fund";

export type DistributionRuleId = Id;

type Common = {
  distributionRuleId: DistributionRuleId;
  budgetId: BudgetId;
  fundId: FundId;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
};

type FromSurplus = {
  sourceType: "SURPLUS";
  categoryId: null;
};

type FromCategory = {
  sourceType: "CATEGORY";
  categoryId: CategoryId;
};

type FixedAllocation = {
  allocationType: "FIXED";
  fixedAmount: Money;
  percent: null;
};

type PercentAllocation = {
  allocationType: "PERCENT";
  fixedAmount: null;
  percent: number; // 0..1
};

export type DistributionRule =
  | (Common & FromSurplus & FixedAllocation)
  | (Common & FromSurplus & PercentAllocation)
  | (Common & FromCategory & FixedAllocation)
  | (Common & FromCategory & PercentAllocation);
