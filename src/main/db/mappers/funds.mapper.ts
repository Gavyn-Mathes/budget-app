// main/db/mappers/funds.mapper.ts
import type { Fund } from "../../../shared/types/fund";

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
