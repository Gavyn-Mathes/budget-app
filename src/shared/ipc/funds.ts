// shared/ipc/funds.ts
import { z } from "zod";
import { IdSchema } from "../schemas/common";
import { FundSchema } from "../schemas/fund";

export const FUNDS_IPC = {
  List: "funds:list",
  Upsert: "funds:upsert",
  Delete: "funds:delete",
} as const;

export const ListReq = z.object({});
export const ListRes = z.object({ funds: z.array(FundSchema) });

export const UpsertReq = z.object({ fund: FundSchema });
export const UpsertRes = z.object({ ok: z.literal(true) });

export const DeleteReq = z.object({ fundId: IdSchema });
export const DeleteRes = z.object({ ok: z.literal(true) });
