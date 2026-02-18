// src/renderer/src/api/transactions.ts
import type { Transaction } from "../../../shared/types/transaction";
import { getApi, unwrapList } from "./common";

const api = () => getApi().transactions;
type Api = ReturnType<typeof api>;

type ListByMonthReq = Parameters<Api["listByMonth"]>[0];
type UpsertReq = Parameters<Api["upsert"]>[0];
type DeleteReq = Parameters<Api["delete"]>[0];

export const transactionsClient = {
  listByMonth: unwrapList<ListByMonthReq, "transactions", Transaction>(
    (req: ListByMonthReq) => api().listByMonth(req),
    "transactions"
  ),
  upsert: (req: UpsertReq) => api().upsert(req),
  delete: (req: DeleteReq) => api().delete(req),
};
