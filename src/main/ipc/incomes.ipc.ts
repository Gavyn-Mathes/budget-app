// src/main/ipc/incomes.ipc.ts

import * as Shared from "../../shared/ipc/incomes";
import { registerZodIpc } from "./common";
import { getDb } from "../db";
import { IncomeRepo } from "../db/repos/incomes.repo";
import { AssetsRepo } from "../db/repos/assets.repo";
import { AccountsRepo } from "../db/repos/accounts.repo";
import { FundEventRepo } from "../db/repos/fund_events.repo";
import { EventTypesRepo } from "../db/repos/event_types.repo";
import { IncomeService } from "../services/incomes.service";

export function registerIncomesIpc() {
  const db = getDb();
  const repo = new IncomeRepo(db);
  const assetsRepo = new AssetsRepo(db);
  const accountsRepo = new AccountsRepo(db);
  const fundEventsRepo = new FundEventRepo(db);
  const eventTypesRepo = new EventTypesRepo(db);
  const service = new IncomeService(
    db,
    repo,
    assetsRepo,
    accountsRepo,
    fundEventsRepo,
    eventTypesRepo
  );

  registerZodIpc({
    namespace: "incomes",
    shared: Shared,
    impl: service,
    argMap: {
      Upsert: (req) => [req.income, req.monthKey],
    },
    responseMap: {
      GetMonth: (month) => ({ month }),
      UpsertMonth: (month) => ({ ok: true, month }),
      Upsert: (income) => ({ ok: true, income }),
      Delete: () => ({ ok: true }),
    },
  });
}
