// src/renderer/src/api/budget_lines.ts
import { BudgetLine } from "../../../shared/types/budget_line";
import { getApi, unwrapList } from "./common";

const api = () => getApi().budgetLines;
type Api = ReturnType<typeof api>;

type ListByBudgetReq = Parameters<Api["listByBudget"]>[0];
type UpsertManyReq = Parameters<Api["upsertMany"]>[0];
type DeleteOneReq = Parameters<Api["deleteOne"]>[0];

export const budgetLinesClient = {
  listByBudget: unwrapList<ListByBudgetReq, "budgetLines", BudgetLine>(
    (req: ListByBudgetReq) => api().listByBudget(req),
    "budgetLines"
  ),
  upsertMany: (req: UpsertManyReq) => api().upsertMany(req),
  deleteOne: (req: DeleteOneReq) => api().deleteOne(req),
};
