// shared/types/account_type.ts
import type { Id, IsoTimestamp } from "./common";

export type AccountTypeId = Id;

export interface AccountType {
  accountTypeId: AccountTypeId;
  accountType: string;   // display label, e.g. "Checking", "Brokerage"
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}
