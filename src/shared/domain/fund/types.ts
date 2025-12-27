import type { EntryKind, TaxTreatment } from "./constants"

// A "Fund" is a purpose-based pool of money (where money is *for*, not where it *lives*).
// Example keys: "EFUND", "RENT", "GROCERIES".
// Note: balance is typically derived/cached from FundEntry rows.
export type Fund = {
  id: string               // UUID/ULID
  key: string              // stable unique code, e.g. "EFUND"
  name: string             // display name, e.g. "Emergency Fund"
  currency: "USD"          // currency code
  balance: number          // cached/derived balance (sum of FundEntry amounts)
  updatedAt: string        // ISO timestamp of last change
}

// A single ledger entry that changes a fund’s balance.
// Convention: +amount adds to the fund, -amount subtracts from the fund.
export type FundEntry = {
  id: string                 // UUID/ULID
  fundId: string             // Fund.id this entry applies to
  date: string               // ISO date or ISO timestamp (choose one and stick to it)
  amount: number             // signed amount: +inflow, -outflow
  kind: EntryKind            // high-level direction: "INCOME" | "EXPENSE"
  categoryId: string    // what it was for: "RENT" | "FOOD" | "GIFT" | ...
  taxTreatment?: TaxTreatment// tax flag (optional): "TAXABLE" | "NONTAXABLE" | "UNKNOWN"
  memo?: string              // optional free-text note
}

// Convenience wrapper that links the two FundEntry records created for a transfer.
// The ledger entries are what actually affect balances.
export type FundTransfer = {
  id: string            // UUID/ULID
  fromFundId: string    // source fund
  toFundId: string      // destination fund
  date: string          // ISO date or timestamp (match FundEntry)
  amount: number        // positive amount moved
  memo?: string         // optional note
  fromEntryId: string   // FundEntry id with amount = -amount
  toEntryId: string     // FundEntry id with amount = +amount
}