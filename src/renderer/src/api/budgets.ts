// src/renderer/src/api/budgets.ts
import { Budget } from "../../../shared/types/budget";
import { getApi, unwrapList } from "./common";

const api = () => getApi().budgets;
type Api = ReturnType<typeof api>;

type GetByMonthReq = Parameters<Api["getByMonth"]>[0];
type UpsertReq = Parameters<Api["upsert"]>[0];
type ListReq = Parameters<Api["list"]>[0];
type CopyToNextMonthReq = Parameters<Api["copyToNextMonth"]>[0];
type ApplyDistributionsReq = Parameters<Api["applyDistributions"]>[0];
type UndoDistributionsReq = Parameters<Api["undoDistributions"]>[0];
type TransferIncomeToSpendingReq = Parameters<Api["transferIncomeToSpending"]>[0];

export const budgetsClient = {
  getByMonth: (req: GetByMonthReq) => api().getByMonth(req),
  upsert: (req: UpsertReq) => api().upsert(req),
  list: unwrapList<ListReq, "budgets", Budget>((req: ListReq) => api().list(req), "budgets"),
  copyToNextMonth: (req: CopyToNextMonthReq) => api().copyToNextMonth(req),
  applyDistributions: (req: ApplyDistributionsReq) => api().applyDistributions(req),
  undoDistributions: (req: UndoDistributionsReq) => api().undoDistributions(req),
  transferIncomeToSpending: (req: TransferIncomeToSpendingReq) =>
    api().transferIncomeToSpending(req),
};
