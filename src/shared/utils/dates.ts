// src/shared/utils/dates.ts
// Month name type derived from MONTH_NAMES ("January" | ... | "December")
export type MonthName = (typeof MONTH_NAMES)[number]

/** ISO date/timestamp -> "YYYY" */
export function toYearKey(isoDateOrTs: string): string {
  // Works with "2025-12-26" or "2025-12-26T18:30:00Z"
  return isoDateOrTs.slice(0, 4) // "2025"
}

/** ISO date/timestamp -> "MM" (zero-padded) */
export function toMonthNumber(isoDateOrTs: string): string {
  // Works with "2025-12-26" or "2025-12-26T18:30:00Z"
  return isoDateOrTs.slice(5, 7) // "12"
}

/** ISO date/timestamp -> "YYYY-MM" (useful budget grouping key) */
export function toMonthKey(isoDateOrTs: string): string {
  // Works with "2025-12-26" or "2025-12-26T18:30:00Z"
  return isoDateOrTs.slice(0, 7) // "2025-12"
}

// Canonical list of month display names (used for conversions + strong typing)
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const

/** 1..12 -> "January".."December" */
export function monthNumberToName(month: number): MonthName {
  // Validate inputs early so callers don't silently get wrong results
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error(`month must be an integer 1..12 (got ${month})`)
  }
  return MONTH_NAMES[month - 1]
}

/** "January".."December" (case-insensitive) -> 1..12 */
export function monthNameToNumber(name: string): number {
  // Normalize (trim + case-fold) for user-entered inputs
  const idx = MONTH_NAMES.findIndex(m => m.toLowerCase() === name.trim().toLowerCase())
  if (idx === -1) {
    throw new Error(`invalid month name: "${name}"`)
  }
  return idx + 1
}

/** "01".."12" -> "January".."December" */
export function monthStringToName(mm: string): MonthName {
  // Parse "MM" and reuse the numeric conversion
  const month = Number(mm)
  return monthNumberToName(month)
}

/** 1..12 -> "01".."12" */
export function monthNumberToString(month: number): string {
  // Always return a two-digit month string
  return String(month).padStart(2, "0")
}
