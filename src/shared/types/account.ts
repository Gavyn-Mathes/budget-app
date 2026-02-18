// shared/types/account.ts
import type { AccountDTO, AccountUpsertInputDTO, AccountWithTotalsDTO } from "../schemas/account";

export type AccountId = AccountDTO["accountId"];
export type Account = AccountDTO;
export type AccountUpsertInput = AccountUpsertInputDTO;
export type AccountWithTotals = AccountWithTotalsDTO;
