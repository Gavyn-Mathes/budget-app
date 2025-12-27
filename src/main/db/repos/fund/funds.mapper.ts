import type { Fund } from "../../../../shared/domain/fund"

// DB row shape for the `funds` table (snake_case to match SQLite columns).
export type FundRow = {
  id: string
  key: string
  name: string
  currency: "USD"
  updated_at: string
}

// Convert a domain Fund (camelCase) into a DB row (snake_case).
export function fundToRow(fund: Fund): FundRow {
  return {
    id: fund.id,
    key: fund.key,
    name: fund.name,
    currency: fund.currency,
    updated_at: fund.updatedAt,
  }
}

// Convert a DB row into a domain Fund.
// `balance` is not stored on the funds table; compute it (SUM of entries) and pass it in.
export function rowToFund(row: FundRow, balance = 0): Fund {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    currency: row.currency,
    balance,
    updatedAt: row.updated_at,
  }
}
