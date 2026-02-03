// main/db/mappers/account_types.mapper.ts
import type { AccountType } from "../../../shared/types/account_type";

export type DbAccountTypeRow = {
  account_type_id: string;
  account_type: string;
  created_at: string;
  updated_at: string;
};

export function mapAccountType(row: DbAccountTypeRow): AccountType {
  return {
    accountTypeId: row.account_type_id,
    accountType: row.account_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
