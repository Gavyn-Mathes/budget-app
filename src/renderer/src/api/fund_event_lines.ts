// src/renderer/src/api/fund_event_lines.ts
import type { FundEventLine } from "../../../shared/types/fund_event_line";
import { getApi, unwrapList } from "./common";

const api = () => getApi().fundEventLines;
type Api = ReturnType<typeof api>;

type ListByEventReq = Parameters<Api["listByEvent"]>[0];
type ListByAssetReq = Parameters<Api["listByAsset"]>[0];
type ListByLiabilityReq = Parameters<Api["listByLiability"]>[0];

export const fundEventLinesClient = {
  listByEvent: unwrapList<ListByEventReq, "fundEventLines", FundEventLine>(
    (req: ListByEventReq) => api().listByEvent(req),
    "fundEventLines"
  ),
  listByAsset: unwrapList<ListByAssetReq, "fundEventLines", FundEventLine>(
    (req: ListByAssetReq) => api().listByAsset(req),
    "fundEventLines"
  ),
  listByLiability: unwrapList<ListByLiabilityReq, "fundEventLines", FundEventLine>(
    (req: ListByLiabilityReq) => api().listByLiability(req),
    "fundEventLines"
  ),
};
