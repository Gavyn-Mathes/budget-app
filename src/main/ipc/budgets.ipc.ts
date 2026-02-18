// src/main/ipc/budgets.ipc.ts

import * as Shared from "../../shared/ipc/budgets";
import { registerZodIpc } from "./common";
import { getDb } from "../db";
import { BudgetsRepo } from "../db/repos/budgets.repo";
import { BudgetLinesRepo } from "../db/repos/budget_lines.repo";
import { DistributionRepo } from "../db/repos/distributions.repo";
import { TransactionsRepo } from "../db/repos/transactions.repo";
import { IncomeRepo } from "../db/repos/incomes.repo";
import { AssetsRepo } from "../db/repos/assets.repo";
import { AccountsRepo } from "../db/repos/accounts.repo";
import { FundEventRepo } from "../db/repos/fund_events.repo";
import { EventTypesRepo } from "../db/repos/event_types.repo";
import { BudgetsService } from "../services/budgets.service";

export function registerBudgetsIpc() {
  const db = getDb();
  const repo = new BudgetsRepo(db);
  const linesRepo = new BudgetLinesRepo(db);
  const distributionsRepo = new DistributionRepo(db);
  const transactionsRepo = new TransactionsRepo(db);
  const incomesRepo = new IncomeRepo(db);
  const assetsRepo = new AssetsRepo(db);
  const accountsRepo = new AccountsRepo(db);
  const fundEventsRepo = new FundEventRepo(db);
  const eventTypesRepo = new EventTypesRepo(db);
  const service = new BudgetsService(
    db,
    repo,
    linesRepo,
    distributionsRepo,
    transactionsRepo,
    incomesRepo,
    assetsRepo,
    accountsRepo,
    fundEventsRepo,
    eventTypesRepo
  );

  registerZodIpc({
    namespace: "budgets",
    shared: Shared,
    impl: service,
    responseMap: {
      GetByMonth: (budget) => ({ budget }),
      Upsert: (budget) => ({ ok: true, budget }),
      CopyToNextMonth: (budget) => ({ ok: true, budget }),
      ApplyDistributions: (result) => ({ ok: true, budget: result.budget, createdEventIds: result.createdEventIds }),
      UndoDistributions: (result) => ({ ok: true, budget: result.budget, deletedEventIds: result.deletedEventIds }),
      TransferIncomeToSpending: (result) => ({
        ok: true,
        budget: result.budget,
        eventId: result.eventId,
        amountMinor: result.amountMinor,
        sourceAssetId: result.sourceAssetId,
        destinationAssetId: result.destinationAssetId,
      }),
    },
  });
}
