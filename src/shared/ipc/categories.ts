// shared/ipc/category.ts
import { z } from "zod";
import { IdSchema } from "../schemas/common";
import { CategorySchema } from "../schemas/category";

export const CATEGORIES_IPC = {
  List: "categories:list",
  Upsert: "categories:upsert",
  Delete: "categories:delete",
} as const;

export const ListReq = z.object({});
export const ListRes = z.object({ categories: z.array(CategorySchema) });

export const UpsertReq = z.object({ category: CategorySchema });
export const UpsertRes = z.object({ ok: z.literal(true) });

export const DeleteReq = z.object({ categoryId: IdSchema });
export const DeleteRes = z.object({ ok: z.literal(true) });
