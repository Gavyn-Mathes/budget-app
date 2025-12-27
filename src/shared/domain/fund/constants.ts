export const ENTRY_KIND = ["INCOME", "EXPENSE"] as const
export type EntryKind = (typeof ENTRY_KIND)[number]

export const TAX_TREATMENT = ["TAXABLE", "NONTAXABLE", "UNKNOWN"] as const
export type TaxTreatment = (typeof TAX_TREATMENT)[number]