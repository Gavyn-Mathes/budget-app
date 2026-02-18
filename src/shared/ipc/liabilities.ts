// shared/ipc/liabilities.ts
import { z } from "zod";
import { IdSchema } from "../schemas/common";
import { LiabilitySchema, LiabilityUpsertInputSchema, LiabilityWithBalanceSchema } from "../schemas/liability";
import { LiabilityAccountMoveCreateInputSchema, LiabilityAccountMoveSchema } from "../schemas/liability_account_move";

export const LIABILITIES_IPC = {
  List: "liabilities:list",
  ListWithBalances: "liabilities:list-with-balances",
  ListByFund: "liabilities:list-by-fund",
  GetById: "liabilities:get-by-id",
  Upsert: "liabilities:upsert",
  MoveAccount: "liabilities:move-account",
  Delete: "liabilities:delete",
} as const;

export const ListReq = z.object({});
export const ListRes = z.object({ liabilities: z.array(LiabilitySchema) });

export const ListWithBalancesReq = z.object({});
export const ListWithBalancesRes = z.object({ liabilities: z.array(LiabilityWithBalanceSchema) });

export const ListByFundReq = z.object({ fundId: IdSchema });
export const ListByFundRes = z.object({ liabilities: z.array(LiabilitySchema) });

export const GetByIdReq = z.object({ liabilityId: IdSchema });
export const GetByIdRes = z.object({ liability: LiabilitySchema.nullable() });

export const UpsertReq = z.object({ liability: LiabilityUpsertInputSchema });
export const UpsertRes = z.object({ ok: z.literal(true), liability: LiabilitySchema });

export const MoveAccountReq = z.object({ data: LiabilityAccountMoveCreateInputSchema });
export const MoveAccountRes = z.object({ ok: z.literal(true), data: LiabilityAccountMoveSchema });

export const DeleteReq = z.object({ liabilityId: IdSchema });
export const DeleteRes = z.object({ ok: z.literal(true) });
