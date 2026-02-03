// shared/constants/budget.ts
export const ALLOCATION_TYPE = ["FIXED", "PERCENT"] as const;
export type AllocationType = (typeof ALLOCATION_TYPE)[number];
