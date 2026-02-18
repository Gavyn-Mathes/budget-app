// shared/types/account_type.ts
import type { AccountTypeDTO, AccountTypeUpsertInputDTO } from "../schemas/account_type";

export type AccountTypeId = AccountTypeDTO["accountTypeId"];
export type AccountType = AccountTypeDTO;
export type AccountTypeUpsertInput = AccountTypeUpsertInputDTO;
