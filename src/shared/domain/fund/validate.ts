import { ENTRY_KIND } from "./constants"
import type { FundEntry } from "./types"

export function validateFundEntry(e: FundEntry): string[] {
  const errors: string[] = []

  if (!e.id) errors.push("id is required")
  if (!e.fundId) errors.push("fundId is required")
  if (!e.date) errors.push("date is required")
  if (typeof e.amount !== "number" || Number.isNaN(e.amount)) errors.push("amount must be a number")
  if (e.amount === 0) errors.push("amount cannot be 0")

  // Ensure kind is one of the allowed values (runtime)
  if (!ENTRY_KIND.includes(e.kind)) {
    errors.push(`kind must be one of: ${ENTRY_KIND.join(", ")}`)
    return errors
  }

  // Sign rules
  if (e.kind === "INCOME" && e.amount < 0) errors.push("INCOME entries must have a positive amount")
  if (e.kind === "EXPENSE" && e.amount > 0) errors.push("EXPENSE entries must have a negative amount")

  return errors
}
