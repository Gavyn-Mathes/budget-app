// src/renderer/src/components/features/accounts/types/utils/accountTypes.helpers.ts
import type { AccountType, AccountTypeUpsertInput } from "../../../../../../../shared/types/account_type";

export function makeDraftAccountType(): AccountTypeUpsertInput {
  return {
    accountTypeId: undefined,
    accountType: "",
  } as any;
}

export function upsertInputFromAccountType(row: AccountType): AccountTypeUpsertInput {
  return {
    accountTypeId: (row as any).accountTypeId,
    accountType: (row as any).accountType,
  } as any;
}

export function normalizeAccountTypeUpsert(x: AccountTypeUpsertInput): AccountTypeUpsertInput {
  return {
    ...x,
    accountType: String((x as any).accountType ?? "").trim(),
  } as any;
}
