// main/db/mappers/funds.mapper.ts
import type { Fund, FundWithTotals } from "../../../shared/types/fund";

export type DbFundRow = {
  fund_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export function mapFund(row: DbFundRow): Fund {
  return {
    fundId: row.fund_id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type DbFundWithTotalsRow = {
  fund_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  assets_minor: number;
  liabilities_minor: number;
};

export function mapFundWithTotals(row: DbFundWithTotalsRow): FundWithTotals {
  const assetsMinor = Number(row.assets_minor ?? 0);
  const liabilitiesMinor = Number(row.liabilities_minor ?? 0);

  return {
    fundId: row.fund_id,
    name: row.name,
    description: row.description ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,

    assetsMinor,
    liabilitiesMinor,
    netMinor: assetsMinor - liabilitiesMinor,
  };
}
