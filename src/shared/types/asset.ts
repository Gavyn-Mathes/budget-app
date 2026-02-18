// shared/types/asset.ts
import type { AssetDTO, AssetUpsertInputDTO, AssetWithBalanceDTO } from "../schemas/asset";

export type Asset = AssetDTO;
export type AssetUpsertInput = AssetUpsertInputDTO;
export type AssetWithBalance = AssetWithBalanceDTO;
export type AssetId = AssetDTO["assetId"];

export type CashAsset = Extract<Asset, { assetType: "CASH" }>;
export type StockAsset = Extract<Asset, { assetType: "STOCK" }>;
export type NoteAsset = Extract<Asset, { assetType: "NOTE" }>;

export function isCashAsset(asset: Asset): asset is CashAsset {
  return asset.assetType === "CASH";
}

export function isStockAsset(asset: Asset): asset is StockAsset {
  return asset.assetType === "STOCK";
}

export function isNoteAsset(asset: Asset): asset is NoteAsset {
  return asset.assetType === "NOTE";
}
