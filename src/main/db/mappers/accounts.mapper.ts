// main/db/mappers/accounts.mapper.ts
import type { Account, AccountWithTotals } from "../../../shared/types/account";

export type DbAccountRow = {
  account_id: string;
  name: string;
  account_type_id: string;
  default_currency_code: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type DbAccountWithTotalsRow = {
  account_id: string;
  name: string;
  account_type_id: string;
  default_currency_code: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  assets_minor: number;
  liabilities_minor: number;
};

export function mapAccount(row: DbAccountRow): Account {
  return {
    accountId: row.account_id,
    name: row.name,
    accountTypeId: row.account_type_id,
    defaultCurrencyCode: row.default_currency_code as Account["defaultCurrencyCode"],
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAccountWithTotals(row: DbAccountWithTotalsRow): AccountWithTotals {
  const assetsMinor = Number(row.assets_minor ?? 0);
  const liabilitiesMinor = Number(row.liabilities_minor ?? 0);

  return {
    accountId: row.account_id,
    name: row.name,
    accountTypeId: row.account_type_id,
    defaultCurrencyCode: row.default_currency_code as AccountWithTotals["defaultCurrencyCode"],
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    assetsMinor,
    liabilitiesMinor,
    netMinor: assetsMinor - liabilitiesMinor,
  };
}
