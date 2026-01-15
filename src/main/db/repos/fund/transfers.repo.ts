import { randomUUID } from "crypto"
import { getDb } from "../../index"
import type { FundTransfer } from "../../../../shared/domain/fund"
import { toMonthKey } from "../../../../shared/utils/dates"

const TRANSFER_CATEGORY_ID = "cat_transfer" as const

export function createFundTransfer(input: Omit<FundTransfer, "id">): FundTransfer {
  const db = getDb()
  const nowIso = new Date().toISOString()

  const transfer: FundTransfer = {
    ...input,
    id: randomUUID(),
  }

  const insertTransfer = db.prepare(`
    INSERT INTO fund_transfers (
      id, from_fund_id, to_fund_id, date, month_key, amount, memo, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertEntry = db.prepare(`
    INSERT INTO fund_entries (
      id, fund_id, transfer_id, date, month_key, amount, kind, category_id,
      tax_treatment, memo, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const tx = db.transaction(() => {
    insertTransfer.run(
      transfer.id,
      transfer.fromFundId,
      transfer.toFundId,
      transfer.date,
      toMonthKey(transfer.date),
      transfer.amount,
      transfer.memo ?? null,
      nowIso,
      nowIso
    )

    // from fund (negative)
    insertEntry.run(
      randomUUID(),
      transfer.fromFundId,
      transfer.id,
      transfer.date,
      toMonthKey(transfer.date),
      -transfer.amount,
      "TRANSFER",
      TRANSFER_CATEGORY_ID,
      null,
      transfer.memo ?? null,
      nowIso,
      nowIso
    )

    // to fund (positive)
    insertEntry.run(
      randomUUID(),
      transfer.toFundId,
      transfer.id,
      transfer.date,
      toMonthKey(transfer.date),
      transfer.amount,
      "TRANSFER",
      TRANSFER_CATEGORY_ID,
      null,
      transfer.memo ?? null,
      nowIso,
      nowIso
    )
  })

  tx()
  return transfer
}

export function deleteFundTransfer(transferId: string): boolean {
  const db = getDb()
  const res = db.prepare(`DELETE FROM fund_transfers WHERE id = ?`).run(transferId)
  return res.changes > 0
}

export function listFundTransfers(fromFundId?: string, toFundId?: string): FundTransfer[] {
  const db = getDb()

  // If both provided: show between the two in either direction
  if (fromFundId && toFundId) {
    const rows = db.prepare(`
      SELECT
        id,
        from_fund_id as fromFundId,
        to_fund_id as toFundId,
        date,
        amount,
        memo
      FROM fund_transfers
      WHERE
        (from_fund_id = ? AND to_fund_id = ?)
        OR
        (from_fund_id = ? AND to_fund_id = ?)
      ORDER BY date DESC
    `).all(fromFundId, toFundId, toFundId, fromFundId)

    return (rows ?? []) as FundTransfer[]
  }

  // If only one side provided, filter that side
  if (fromFundId) {
    const rows = db.prepare(`
      SELECT
        id,
        from_fund_id as fromFundId,
        to_fund_id as toFundId,
        date,
        amount,
        memo
      FROM fund_transfers
      WHERE from_fund_id = ?
      ORDER BY date DESC
    `).all(fromFundId)

    return (rows ?? []) as FundTransfer[]
  }

  if (toFundId) {
    const rows = db.prepare(`
      SELECT
        id,
        from_fund_id as fromFundId,
        to_fund_id as toFundId,
        date,
        amount,
        memo
      FROM fund_transfers
      WHERE to_fund_id = ?
      ORDER BY date DESC
    `).all(toFundId)

    return (rows ?? []) as FundTransfer[]
  }

  // No filters: all transfers
  const rows = db.prepare(`
    SELECT
      id,
      from_fund_id as fromFundId,
      to_fund_id as toFundId,
      date,
      amount,
      memo
    FROM fund_transfers
    ORDER BY date DESC
  `).all()

  return (rows ?? []) as FundTransfer[]
}
