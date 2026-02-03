// shared/types/liability.ts
import type { Id, IsoTimestamp, IsoDate, Money, CurrencyCode } from "./common";
import type { FundId } from "./fund";
import type { AccountId } from "./account";
import type { LiabilityType, MinPaymentType, PaymentFrequency } from "../constants/liability";

export type LiabilityId = Id;

type LiabilityBase = {
  liabilityId: LiabilityId;
  fundId: FundId;
  accountId: AccountId;

  liabilityType: LiabilityType;

  name: string;
  apr: number | null;           // 0..1
  currencyCode: CurrencyCode;   // "USD"
  currentBalance: Money;        // >= 0

  openedDate: IsoDate | null;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;

  isActive: boolean;
  notes: string | null;
};

export type LoanLiability = LiabilityBase & {
  liabilityType: "LOAN";

  originalPrincipal: Money | null;
  maturityDate: IsoDate | null;
  paymentAmount: Money | null;
  paymentFrequency: PaymentFrequency | null;
};

type CreditMinPayment =
  | { minPaymentType: null; minPaymentValue: null }
  | { minPaymentType: "FIXED"; minPaymentValue: number }   // >= 0
  | { minPaymentType: "PERCENT"; minPaymentValue: number } // 0..1

export type CreditLiability = LiabilityBase &
  CreditMinPayment & {
    liabilityType: "CREDIT";

    creditLimit: Money | null;
    dueDay: number | null;              // 1..31
    statementDay: number | null;        // 1..31
  };

export type Liability = LoanLiability | CreditLiability;
