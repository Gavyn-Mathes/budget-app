// Re-export runtime values
export {
  ENTRY_KIND,
  TAX_TREATMENT,
  EntryKind,
  TaxTreatment,
} from "./constants"

// Re-export types (type-only so it doesn't affect bundling)
export type {
  Fund,
  FundEntry,
  FundTransfer,
} from "./types"

// Re-export domain logic
export { validateFundEntry } from "./validate"
