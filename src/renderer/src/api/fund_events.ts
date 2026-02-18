// src/renderer/src/api/fund_events.ts
import type { FundEvent } from "../../../shared/types/fund_event";
import { getApi, unwrapList } from "./common";

const api = () => getApi().fundEvents;
type Api = ReturnType<typeof api>;

type ListByDateRangeReq = Parameters<Api["listByDateRange"]>[0];
type GetByIdReq = Parameters<Api["getById"]>[0];
type UpsertReq = Parameters<Api["upsert"]>[0];
type MoveAssetToAccountReq = Parameters<Api["moveAssetToAccount"]>[0];
type DeleteReq = Parameters<Api["delete"]>[0];

export const fundEventsClient = {
  listByDateRange: unwrapList<ListByDateRangeReq, "fundEvents", FundEvent>(
    (req: ListByDateRangeReq) => api().listByDateRange(req),
    "fundEvents"
  ),
  getById: (req: GetByIdReq) => api().getById(req),
  upsert: (req: UpsertReq) => api().upsert(req),
  moveAssetToAccount: (req: MoveAssetToAccountReq) => api().moveAssetToAccount(req),
  delete: (req: DeleteReq) => api().delete(req),
};
