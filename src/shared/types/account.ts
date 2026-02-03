// shared/types/account.ts
import type { Id, CurrencyCode, IsoTimestamp } from "./common";
import type { AccountTypeId } from "./account_type";

export type AccountId = Id;

export interface Account {
  accountId: AccountId;
  name: string;

  accountTypeId: AccountTypeId;        // FK -> account_types.account_type_id
  defaultCurrencyCode: CurrencyCode;

  description: string | null;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}
