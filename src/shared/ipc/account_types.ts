// shared/ipc/account_types.ts
import { z } from "zod";
import { IdSchema } from "../schemas/common";
import { AccountTypeSchema, AccountTypeUpsertInputSchema } from "../schemas/account_type";

export const ACCOUNT_TYPES_IPC = {
  List: "account-types:list",
  Upsert: "account-types:upsert",
  Delete: "account-types:delete",
} as const;

export const ListReq = z.object({});
export const ListRes = z.object({ accountTypes: z.array(AccountTypeSchema) });

export const UpsertReq = z.object({ accountType: AccountTypeUpsertInputSchema });
export const UpsertRes = z.object({
  ok: z.literal(true),
  accountType: AccountTypeSchema,
});

export const DeleteReq = z.object({ accountTypeId: IdSchema });
export const DeleteRes = z.object({ ok: z.literal(true) });
