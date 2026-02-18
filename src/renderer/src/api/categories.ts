// src/renderer/src/api/categories.ts
import type { Category } from "../../../shared/types/category";
import { getApi, unwrapList } from "./common";

const api = () => getApi().categories;
type Api = ReturnType<typeof api>;

type ListReq = Parameters<Api["list"]>[0];
type UpsertReq = Parameters<Api["upsert"]>[0];
type DeleteReq = Parameters<Api["delete"]>[0];

export const categoriesClient = {
  list: unwrapList<ListReq, "categories", Category>((req: ListReq) => api().list(req), "categories"),
  upsert: (req: UpsertReq) => api().upsert(req),
  delete: (req: DeleteReq) => api().delete(req),
};
