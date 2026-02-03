// shared/types/asset.ts
import type { Id, IsoTimestamp, IsoDate, CurrencyCode } from "./common";
import type { FundId } from "./fund";
import type { AccountId } from "./account";
import type { AssetType } from "../constants/asset";

export type AssetId = Id;

type AssetBase = {
  assetId: AssetId;
  fundId: FundId;
  accountId: AccountId;

  name: string;
  description: string | null;

  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;

  assetType: AssetType;
};

export type CashAsset = AssetBase & {
  assetType: "CASH";
  currencyCode: CurrencyCode;
};

export type StockAsset = AssetBase & {
  assetType: "STOCK";
  ticker: string; 
};

export type NoteAsset = AssetBase & {
  assetType: "NOTE";
  counterparty: string | null;
  interestRate: number;
  startDate: IsoDate | null;
  maturityDate: IsoDate | null;
};

export type Asset = CashAsset | StockAsset | NoteAsset;
