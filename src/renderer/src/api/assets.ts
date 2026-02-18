// src/renderer/src/api/assets.ts
import { Asset, AssetWithBalance } from "../../../shared/types/asset";
import { getApi, unwrapList } from "./common";

const api = () => getApi().assets;
type Api = ReturnType<typeof api>;

type ListReq = Parameters<Api["list"]>[0];
type ListWithBalancesReq = Parameters<Api["listWithBalances"]>[0];
type ListByFundReq = Parameters<Api["listByFund"]>[0];
type GetByIdReq = Parameters<Api["getById"]>[0];
type UpsertReq = Parameters<Api["upsert"]>[0];
type DeleteReq = Parameters<Api["delete"]>[0];

export const assetsClient = {
  list: unwrapList<ListReq, "assets", Asset>((req: ListReq) => api().list(req), "assets"),
  listWithBalances: unwrapList<ListWithBalancesReq, "assets", AssetWithBalance>(
    (req: ListWithBalancesReq) => api().listWithBalances(req),
    "assets"
  ),
  listByFund: unwrapList<ListByFundReq, "assets", Asset>((req: ListByFundReq) => api().listByFund(req), "assets"),
  getById: (req: GetByIdReq) => api().getById(req),
  upsert: (req: UpsertReq) => api().upsert(req),
  delete: (req: DeleteReq) => api().delete(req),
};
