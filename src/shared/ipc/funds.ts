// shared/ipc/funds.ts
import { z } from "zod";
import { IdSchema } from "../schemas/common";
import { FundSchema, FundUpsertInputSchema, FundWithTotalsSchema } from "../schemas/fund";

export const FUNDS_IPC = {
  List: "funds:list",
  ListWithTotals: "funds:list-with-totals",
  Upsert: "funds:upsert",
  Delete: "funds:delete",
} as const;

export const ListReq = z.object({});
export const ListRes = z
  .object({ funds: z.array(FundSchema).optional() })
  .transform((x) => ({ funds: x.funds ?? [] }));

export const ListWithTotalsReq = z.object({});
export const ListWithTotalsRes = z
  .object({ funds: z.array(FundWithTotalsSchema).optional() })
  .transform((x) => ({ funds: x.funds ?? [] }));

export const UpsertReq = z.object({ fund: FundUpsertInputSchema });
export const UpsertRes = z.object({ ok: z.literal(true), fund: FundSchema });

export const DeleteReq = z.object({ fundId: IdSchema });
export const DeleteRes = z.object({ ok: z.literal(true) });
