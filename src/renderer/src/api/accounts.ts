// src/renderer/src/api/accounts.ts
import { Account, AccountWithTotals } from "../../../shared/types/account";
import { getApi, unwrapList } from "./common";

const api = () => getApi().accounts;
type Api = ReturnType<typeof api>;

type ListReq = Parameters<Api["list"]>[0];
type ListWithTotalsReq = Parameters<Api["listWithTotals"]>[0];
type UpsertReq = Parameters<Api["upsert"]>[0];
type DeleteReq = Parameters<Api["delete"]>[0];

export const accountsClient = {
  list: unwrapList<ListReq, "accounts", Account>((req: ListReq) => api().list(req), "accounts"),
  listWithTotals: unwrapList<ListWithTotalsReq, "accounts", AccountWithTotals>(
    (req: ListWithTotalsReq) => api().listWithTotals(req),
    "accounts"
  ),
  upsert: (req: UpsertReq) => api().upsert(req),
  delete: (req: DeleteReq) => api().delete(req),
};
