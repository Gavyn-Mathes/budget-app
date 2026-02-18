// shared/ipc/account.ts
import { z } from "zod";
import { IdSchema } from "../schemas/common";
import { AccountSchema, AccountUpsertInputSchema, AccountWithTotalsSchema } from "../schemas/account";

export const ACCOUNTS_IPC = {
  List: "accounts:list",
  ListWithTotals: "accounts:list-with-totals",
  Upsert: "accounts:upsert",
  Delete: "accounts:delete",
} as const;

export const ListReq = z.object({});
export const ListRes = z.object({ accounts: z.array(AccountSchema) });

export const ListWithTotalsReq = z.object({});
export const ListWithTotalsRes = z.object({ accounts: z.array(AccountWithTotalsSchema) });

/**
 * UI sends editable fields + optional id (no timestamps).
 */
export const UpsertReq = z.object({ account: AccountUpsertInputSchema });

/**
 * Return canonical saved record (includes id + timestamps).
 */
export const UpsertRes = z.object({
  ok: z.literal(true),
  account: AccountSchema,
});

export const DeleteReq = z.object({ accountId: IdSchema });
export const DeleteRes = z.object({ ok: z.literal(true) });
