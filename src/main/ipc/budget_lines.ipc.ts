// src/main/ipc/budget_lines.ipc.ts

import * as Shared from "../../shared/ipc/budget_lines";
import { registerZodIpc } from "./common";
import { getDb } from "../db";
import { BudgetLinesRepo } from "../db/repos/budget_lines.repo";
import { BudgetsRepo } from "../db/repos/budgets.repo";
import { IncomeRepo } from "../db/repos/incomes.repo";
import { BudgetLinesService } from "../services/budget_lines.service";

export function registerBudgetLinesIpc() {
  const db = getDb();
  const repo = new BudgetLinesRepo(db);
  const budgetsRepo = new BudgetsRepo(db);
  const incomesRepo = new IncomeRepo(db);
  const service = new BudgetLinesService(db, repo, budgetsRepo, incomesRepo);

  registerZodIpc({
    namespace: "budget_lines",
    shared: Shared,
    impl: service,

    responseMap: {
      UpsertMany: () => ({ ok: true }),
      DeleteOne: () => ({ ok: true }),
    },
  });
}
