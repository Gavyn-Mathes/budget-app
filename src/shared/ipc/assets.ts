// shared/ipc/assets.ts
import { z } from "zod";
import { IdSchema } from "../schemas/common";
import { AssetSchema } from "../schemas/asset";

export const ASSETS_IPC = {
  List: "assets:list",
  ListByFund: "assets:list-by-fund",
  GetById: "assets:get-by-id",
  Upsert: "assets:upsert",
  Delete: "assets:delete",
} as const;

export const ListReq = z.object({});
export const ListRes = z.object({ assets: z.array(AssetSchema) });

export const ListByFundReq = z.object({ fundId: IdSchema });
export const ListByFundRes = z.object({ assets: z.array(AssetSchema) });

export const GetByIdReq = z.object({ assetId: IdSchema });
export const GetByIdRes = z.object({ asset: AssetSchema.nullable() });

export const UpsertReq = z.object({ asset: AssetSchema });
export const UpsertRes = z.object({ ok: z.literal(true) });

export const DeleteReq = z.object({ assetId: IdSchema });
export const DeleteRes = z.object({ ok: z.literal(true) });
