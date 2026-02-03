// shared/constants/liability.ts
export const LIABILITY_TYPE = ["LOAN", "CREDIT"] as const;
export type LiabilityType = (typeof LIABILITY_TYPE)[number];

export const MIN_PAYMENT_TYPE = ["FIXED", "PERCENT"] as const;
export type MinPaymentType = (typeof MIN_PAYMENT_TYPE)[number];

export const PAYMENT_FREQUENCY = ["WEEKLY","BIWEEKLY","MONTHLY","QUARTERLY","YEARLY","OTHER"] as const;
export type PaymentFrequency = (typeof PAYMENT_FREQUENCY)[number];