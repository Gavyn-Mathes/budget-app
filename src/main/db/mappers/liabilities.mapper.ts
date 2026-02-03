// main/db/mappers/liabilities.mapper.ts
import type { Liability } from "../../../shared/types/liability";

export type DbLiabilityJoinedRow = {
  // liability (base)
  liability_id: string;
  fund_id: string;
  account_id: string;

  liability_type: "LOAN" | "CREDIT";

  name: string;
  apr: number | null;
  currency_code: string;
  current_balance: number;

  opened_date: string | null;
  created_at: string;
  updated_at: string;
  is_active: 0 | 1;
  notes: string | null;

  // loans (subtype) - presence flag + fields
  loan_liability_id: string | null;
  original_principal: number | null;
  maturity_date: string | null;
  payment_amount: number | null;
  payment_frequency: string | null;

  // credit (subtype) - presence flag + fields
  credit_liability_id: string | null;
  credit_limit: number | null;
  due_day: number | null;
  min_payment_type: "FIXED" | "PERCENT" | null;
  min_payment_value: number | null;
  statement_day: number | null;
};

export function mapLiability(row: DbLiabilityJoinedRow): Liability {
  const base = {
    liabilityId: row.liability_id,
    fundId: row.fund_id,
    accountId: row.account_id,

    liabilityType: row.liability_type,

    name: row.name,
    apr: row.apr,
    currencyCode: row.currency_code as any,
    currentBalance: row.current_balance as any,

    openedDate: row.opened_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,

    isActive: row.is_active === 1,
    notes: row.notes,
  } as const;

  if (row.liability_type === "LOAN") {
    if (!row.loan_liability_id) {
      throw new Error(`Missing loans subtype row for liability_id=${row.liability_id}`);
    }

    return {
      ...base,
      liabilityType: "LOAN",
      originalPrincipal: row.original_principal as any,
      maturityDate: row.maturity_date,
      paymentAmount: row.payment_amount as any,
      paymentFrequency: row.payment_frequency as any,
    };
  }

  // CREDIT
  if (!row.credit_liability_id) {
    throw new Error(`Missing credit subtype row for liability_id=${row.liability_id}`);
  }

  // min payment union normalization
  const minPayment =
    row.min_payment_type === null
      ? { minPaymentType: null, minPaymentValue: null as null }
      : { minPaymentType: row.min_payment_type as any, minPaymentValue: row.min_payment_value as number };

  return {
    ...base,
    liabilityType: "CREDIT",
    creditLimit: row.credit_limit as any,
    dueDay: row.due_day,
    statementDay: row.statement_day,
    ...minPayment,
  };
}
