// src/renderer/src/api/incomes.ts
import { Income, IncomeMonth } from "../../../shared/types/income";
import { getApi, unwrapList } from "./common";

const api = () => getApi().incomes;
type Api = ReturnType<typeof api>;

type ListByMonthReq = Parameters<Api["listByMonth"]>[0];
type GetMonthReq = Parameters<Api["getMonth"]>[0];
type UpsertMonthReq = Parameters<Api["upsertMonth"]>[0];
type UpsertReq = Parameters<Api["upsert"]>[0];
type DeleteReq = Parameters<Api["delete"]>[0];

export const incomesClient = {
  listByMonth: unwrapList<ListByMonthReq, "incomes", Income>((req: ListByMonthReq) => api().listByMonth(req), "incomes"),
  getMonth: async (req: GetMonthReq): Promise<IncomeMonth | null> => {
    const res = (await api().getMonth(req)) as any;
    return (res?.month ?? null) as IncomeMonth | null;
  },
  upsertMonth: async (req: UpsertMonthReq): Promise<IncomeMonth> => {
    const res = (await api().upsertMonth(req)) as any;
    const month = res?.month;
    if (!month) throw new Error("Expected month from incomes:upsert-month");
    return month as IncomeMonth;
  },
  upsert: (req: UpsertReq) => api().upsert(req),
  delete: (req: DeleteReq) => api().delete(req),
};
