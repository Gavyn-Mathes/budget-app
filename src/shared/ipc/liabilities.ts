// shared/ipc/liabilities.ts
import { z } from "zod";
import { IdSchema } from "../schemas/common";
import { LiabilitySchema } from "../schemas/liability";

export const LIABILITIES_IPC = {
  List: "liabilities:list",
  ListByFund: "liabilities:list-by-fund",
  GetById: "liabilities:get-by-id",
  Upsert: "liabilities:upsert",
  Delete: "liabilities:delete",
} as const;

export const ListReq = z.object({});
export const ListRes = z.object({ liabilities: z.array(LiabilitySchema) });

export const ListByFundReq = z.object({ fundId: IdSchema });
export const ListByFundRes = z.object({ liabilities: z.array(LiabilitySchema) });

export const GetByIdReq = z.object({ liabilityId: IdSchema });
export const GetByIdRes = z.object({ liability: LiabilitySchema.nullable() });

export const UpsertReq = z.object({ liability: LiabilitySchema });
export const UpsertRes = z.object({ ok: z.literal(true) });

export const DeleteReq = z.object({ liabilityId: IdSchema });
export const DeleteRes = z.object({ ok: z.literal(true) });
