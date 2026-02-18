// components/features/accounts/utils/accounts.helpers.ts
import { AccountUpsertInput, Account } from "../../../../../../shared/types/account";

export function makeDraftAccount(): AccountUpsertInput {
  return {
    accountId: undefined,
    name: "",
    accountTypeId: "",
    defaultCurrencyCode: "USD",
    description: null,
  } as any;
}

export function normalizeAccountUpsert(x: AccountUpsertInput): AccountUpsertInput {
  return {
    ...x,
    name: String((x as any).name ?? "").trim(),
    accountTypeId: String((x as any).accountTypeId ?? "").trim(),
    defaultCurrencyCode: String((x as any).defaultCurrencyCode ?? "").trim().toUpperCase(),
    description:
      (x as any).description == null ? null : String((x as any).description).trim() || null,
  } as any;
}

export function upsertInputFromAccount(a: Account): AccountUpsertInput {
  return {
    accountId: (a as any).accountId,
    name: (a as any).name,
    accountTypeId: (a as any).accountTypeId,
    defaultCurrencyCode: (a as any).defaultCurrencyCode,
    description: (a as any).description ?? null,
  } as any;
}
