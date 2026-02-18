// src/renderer/src/api/distributions.ts
import type { DistributionRule } from "../../../shared/types/distribution";
import { getApi, unwrapList } from "./common";

const api = () => getApi().distributions;
type Api = ReturnType<typeof api>;

type ListByBudgetReq = Parameters<Api["listByBudget"]>[0];
type UpsertManyReq = Parameters<Api["upsertMany"]>[0];
type DeleteOneReq = Parameters<Api["deleteOne"]>[0];

export const distributionsClient = {
  listByBudget: unwrapList<ListByBudgetReq, "distributions", DistributionRule>(
    (req: ListByBudgetReq) => api().listByBudget(req),
    "distributions"
  ),
  upsertMany: (req: UpsertManyReq) => api().upsertMany(req),
  deleteOne: (req: DeleteOneReq) => api().deleteOne(req),
};
