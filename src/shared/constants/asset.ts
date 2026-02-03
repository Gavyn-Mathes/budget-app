// shared/constants/asset.ts
export const ASSET_TYPE = ["CASH", "STOCK", "NOTE"] as const;
export type AssetType = (typeof ASSET_TYPE)[number];
