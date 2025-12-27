import { randomUUID } from "crypto"
import { getDb } from "../../index"
import type { FundEntry } from "../../../../shared/domain/fund"
import { toMonthKey } from "../../../../shared/utils/dates"
import { fundEntryToRow } from "./entries.mapper"

export function insertFundEntry(input: Omit<FundEntry, "id">): FundEntry {
  const db = getDb()
  const nowIso = new Date().toISOString()

  const entry: FundEntry = { ...input, id: randomUUID() }
  const row = fundEntryToRow(entry, { monthKey: toMonthKey(entry.date), nowIso })

  db.prepare(`
    INSERT INTO fund_entries (
      id, fund_id, date, month_key, amount, kind, category_id,
      tax_treatment, memo, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    row.id, row.fund_id, row.date, row.month_key, row.amount, row.kind, row.category_id,
    row.tax_treatment, row.memo, row.created_at, row.updated_at
  )

  return entry
}

/**
 * Deletes one fund entry by id.
 * Returns true if deleted, false if not found.
 */
export function deleteFundEntry(entryId: string): boolean {
  const db = getDb()
  const res = db.prepare(`DELETE FROM fund_entries WHERE id = ?`).run(entryId)
  return res.changes > 0
}