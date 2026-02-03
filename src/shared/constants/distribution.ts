// shared/constants/distribution.ts
export const DISTRIBUTION_SOURCE_TYPE = ["SURPLUS", "CATEGORY"] as const;
export type DistributionSourceType = (typeof DISTRIBUTION_SOURCE_TYPE)[number];
