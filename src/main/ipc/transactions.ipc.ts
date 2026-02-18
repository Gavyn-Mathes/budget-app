// src/main/ipc/transactions.ipc.ts

import * as Shared from "../../shared/ipc/transactions";
import { registerZodIpc } from "./common";
import { getDb } from "../db";
import { TransactionsRepo } from "../db/repos/transactions.repo";
import { BudgetsRepo } from "../db/repos/budgets.repo";
import { AssetsRepo } from "../db/repos/assets.repo";
import { AccountsRepo } from "../db/repos/accounts.repo";
import { FundEventRepo } from "../db/repos/fund_events.repo";
import { EventTypesRepo } from "../db/repos/event_types.repo";
import { TransactionsService } from "../services/transactions.service";

export function registerTransactionsIpc() {
  const db = getDb();
  const repo = new TransactionsRepo(db);
  const budgetsRepo = new BudgetsRepo(db);
  const assetsRepo = new AssetsRepo(db);
  const accountsRepo = new AccountsRepo(db);
  const fundEventsRepo = new FundEventRepo(db);
  const eventTypesRepo = new EventTypesRepo(db);
  const service = new TransactionsService(
    db,
    repo,
    budgetsRepo,
    assetsRepo,
    accountsRepo,
    fundEventsRepo,
    eventTypesRepo
  );

  registerZodIpc({
    namespace: "transactions",
    shared: Shared,
    impl: service,
    argMap: {
      Upsert: (req) => [req.transaction, req.monthKey],
    },
    responseMap: {
      Upsert: (transaction) => ({ ok: true, transaction }),
      Delete: () => ({ ok: true }),
    },
  });
}
