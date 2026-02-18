// src/renderer/src/api/account_types.ts
import type { AccountType } from "../../../shared/types/account_type";
import { getApi, unwrapList } from "./common";

const api = () => getApi().accountTypes;
type Api = ReturnType<typeof api>;

type ListReq = Parameters<Api["list"]>[0];
type UpsertReq = Parameters<Api["upsert"]>[0];
type DeleteReq = Parameters<Api["delete"]>[0];

export const accountTypesClient = {
  list: unwrapList<ListReq, "accountTypes", AccountType>((req: ListReq) => api().list(req), "accountTypes"),
  upsert: (req: UpsertReq) => api().upsert(req),
  delete: (req: DeleteReq) => api().delete(req),
};
