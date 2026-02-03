// shared/ipc/account.ts
import { z } from "zod";
import { IdSchema } from "../schemas/common";
import { AccountSchema } from "../schemas/account";

export const ACCOUNTS_IPC = {
  List: "accounts:list",
  Upsert: "accounts:upsert",
  Delete: "accounts:delete",
} as const;

export const ListReq = z.object({});
export const ListRes = z.object({ accounts: z.array(AccountSchema) });

export const UpsertReq = z.object({ account: AccountSchema });
export const UpsertRes = z.object({ ok: z.literal(true) });

export const DeleteReq = z.object({ accountId: IdSchema });
export const DeleteRes = z.object({ ok: z.literal(true) });
