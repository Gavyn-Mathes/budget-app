// src/renderer/src/api/funds.ts
import type { Fund, FundWithTotals } from "../../../shared/types/fund";
import { getApi, unwrapList } from "./common";

const api = () => getApi().funds;
type Api = ReturnType<typeof api>;

type ListReq = Parameters<Api["list"]>[0];
type ListWithTotalsReq = Parameters<Api["listWithTotals"]>[0];
type UpsertReq = Parameters<Api["upsert"]>[0];
type DeleteReq = Parameters<Api["delete"]>[0];

export const fundsClient = {
  list: unwrapList<ListReq, "funds", Fund>((req: ListReq) => api().list(req), "funds"),
  listWithTotals: unwrapList<ListWithTotalsReq, "funds", FundWithTotals>((req: ListWithTotalsReq) => api().listWithTotals(req),"funds"),
  upsert: (req: UpsertReq) => api().upsert(req),
  delete: (req: DeleteReq) => api().delete(req),
};
