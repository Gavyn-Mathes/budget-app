import type { EntryKind, FundEntry, TaxTreatment } from "../../../../shared/domain/fund"

// DB row shape for the `fund_entries` table (snake_case to match SQLite columns).
export type FundEntryRow = {
  id: string
  fund_id: string
  date: string
  month_key: string
  amount: number
  kind: EntryKind
  category_id: string
  tax_treatment: TaxTreatment | null
  memo: string | null
  created_at: string
  updated_at: string
}

// Convert a domain FundEntry (camelCase) into a DB row (snake_case).
// `month_key`, `created_at`, and `updated_at` are derived at write time.
export function fundEntryToRow(
  entry: FundEntry,
  opts: { monthKey: string; nowIso: string }
): FundEntryRow {
  return {
    id: entry.id,
    fund_id: entry.fundId,
    date: entry.date,
    month_key: opts.monthKey,
    amount: entry.amount,
    kind: entry.kind,
    category_id: entry.categoryId,
    tax_treatment: entry.taxTreatment ?? null,
    memo: entry.memo ?? null,
    created_at: opts.nowIso,
    updated_at: opts.nowIso,
  }
}

// Convert a DB row into a domain FundEntry (camelCase).
export function rowToFundEntry(row: FundEntryRow): FundEntry {
  return {
    id: row.id,
    fundId: row.fund_id,
    date: row.date,
    amount: row.amount,
    kind: row.kind,
    categoryId: row.category_id,
    taxTreatment: row.tax_treatment ?? undefined,
    memo: row.memo ?? undefined,
  }
}
