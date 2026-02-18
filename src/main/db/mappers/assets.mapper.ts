// main/db/mappers/assets.mapper.ts
import type { Asset, AssetWithBalance } from "../../../shared/types/asset";

export type DbAssetJoinedRow = {
  // assets
  asset_id: string;
  fund_id: string;
  account_id: string;
  name: string;
  description: string | null;
  asset_type: "CASH" | "STOCK" | "NOTE";
  created_at: string;
  updated_at: string;

  // cash (nullable via LEFT JOIN)
  currency_code: string | null;

  // stocks (nullable via LEFT JOIN)
  ticker: string | null;

  // notes (nullable via LEFT JOIN)
  counterparty: string | null;
  interest_rate: number | null;
  start_date: string | null;
  maturity_date: string | null;
};

export type DbAssetWithBalanceJoinedRow = DbAssetJoinedRow & {
  money_balance_minor: number;
  quantity_balance_minor: number;
};

export function mapAsset(row: DbAssetJoinedRow): Asset {
  const base = {
    assetId: row.asset_id,
    fundId: row.fund_id,
    accountId: row.account_id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    assetType: row.asset_type,
  } as const;

  switch (row.asset_type) {
    case "CASH": {
      if (!row.currency_code) throw new Error(`Missing cash subtype row for asset_id=${row.asset_id}`);
      return {
        ...base,
        assetType: "CASH",
        currencyCode: row.currency_code as any,
      };
    }

    case "STOCK": {
      if (!row.ticker) throw new Error(`Missing stocks subtype row for asset_id=${row.asset_id}`);
      return {
        ...base,
        assetType: "STOCK",
        ticker: row.ticker,
      };
    }

    case "NOTE": {
      if (row.interest_rate === null || row.interest_rate === undefined) {
        throw new Error(`Missing notes subtype row for asset_id=${row.asset_id}`);
      }
      return {
        ...base,
        assetType: "NOTE",
        counterparty: row.counterparty,
        interestRate: row.interest_rate,
        startDate: row.start_date,
        maturityDate: row.maturity_date,
      };
    }

    default:
      throw new Error(`Unknown asset_type ${(row as any).asset_type}`);
  }
}

export function mapAssetWithBalance(row: DbAssetWithBalanceJoinedRow): AssetWithBalance {
  return {
    ...mapAsset(row),
    moneyBalanceMinor: row.money_balance_minor ?? 0,
    quantityBalanceMinor: row.quantity_balance_minor ?? 0,
  };
}
