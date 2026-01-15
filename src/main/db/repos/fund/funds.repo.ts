import { randomUUID } from "crypto"
import { getDb } from "../../index"
import type { Fund } from "../../../../shared/domain/fund"
import { fundToRow } from "./funds.mapper"

export function createFund(input: Omit<Fund, "id" | "balance" | "updatedAt">): Fund {
  const db = getDb()
  const nowIso = new Date().toISOString()

  const fund: Fund = {
    id: randomUUID(),
    key: input.key.trim(),
    name: input.name.trim(),
    currency: input.currency ?? "USD",
    balance: 0,
    updatedAt: nowIso,
  }

  const row = fundToRow(fund)

  db.prepare(`
    INSERT INTO funds (id, key, name, currency, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(row.id, row.key, row.name, row.currency, row.updated_at)

  return fund
}

/**
 * Deletes a fund only if it has NO fund_entries.
 * Returns true if deleted, false if fund not found.
 * Throws if the fund has entries.
 */
export function deleteFund(fundId: string): boolean {
  const db = getDb()

  const countRow = db
    .prepare(`SELECT COUNT(1) AS n FROM fund_entries WHERE fund_id = ?`)
    .get(fundId) as { n: number }

  if (countRow.n > 0) {
    throw new Error(`Cannot delete fund ${fundId}: it has ${countRow.n} entries`)
  }

  const res = db.prepare(`DELETE FROM funds WHERE id = ?`).run(fundId)
  return res.changes > 0
}

export function listFunds(): Fund[] {
  const db = getDb()

  const rows = db
    .prepare(
      `SELECT id, key, name, currency, updated_at as updatedAt
       FROM funds
       ORDER BY name`
    )
    .all()

  return (rows ?? []) as Fund[]
}