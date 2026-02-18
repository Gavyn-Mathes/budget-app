// src/renderer/src/api/liabilities.ts
import type { Liability } from "../../../shared/types/liability";
import type { LiabilityWithBalance } from "../../../shared/types/liability";
import { getApi, unwrapList } from "./common";

const api = () => getApi().liabilities;
type Api = ReturnType<typeof api>;

type ListReq = Parameters<Api["list"]>[0];
type ListWithBalancesReq = Parameters<Api["listWithBalances"]>[0];
type ListByFundReq = Parameters<Api["listByFund"]>[0];
type UpsertReq = Parameters<Api["upsert"]>[0];
type MoveAccountReq = Parameters<Api["moveAccount"]>[0];
type DeleteReq = Parameters<Api["delete"]>[0];

export const liabilitiesClient = {
  list: unwrapList<ListReq, "liabilities", Liability>((req: ListReq) => api().list(req), "liabilities"),
  listWithBalances: unwrapList<ListWithBalancesReq, "liabilities", LiabilityWithBalance>(
    (req: ListWithBalancesReq) => api().listWithBalances(req),
    "liabilities"
  ),
  listByFund: unwrapList<ListByFundReq, "liabilities", Liability>((req: ListByFundReq) => api().listByFund(req), "liabilities"),
  upsert: (req: UpsertReq) => api().upsert(req),
  moveAccount: (req: MoveAccountReq) => api().moveAccount(req),
  delete: (req: DeleteReq) => api().delete(req),
};
