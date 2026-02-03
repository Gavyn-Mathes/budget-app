// src/main/ipc/register.ts
import { registerAccountTypesIpc } from "./account_types.ipc";
import { registerAccountsIpc } from "./accounts.ipc";
import { registerAssetsIpc } from "./assets.ipc";
import { registerBudgetsIpc } from "./budgets.ipc";
import { registerBudgetLinesIpc } from "./budget_lines.ipc";
import { registerCategoriesIpc } from "./categories.ipc";
import { registerDistributionsIpc } from "./distributions.ipc";
import { registerEventTypesIpc } from "./event_types.ipc";
import { registerFundEventsIpc } from "./fund_events.ipc";
import { registerFundEventLinesIpc } from "./fund_event_lines.ipc";
import { registerFundsIpc } from "./funds.ipc";
import { registerIncomesIpc } from "./incomes.ipc";
import { registerLiabilitiesIpc } from "./liabilities.ipc";
import { registerTransactionsIpc } from "./transactions.ipc";

export function registerIpcHandlers() {
  registerAccountTypesIpc();
  registerAccountsIpc();
  registerAssetsIpc();
  registerBudgetsIpc();
  registerBudgetLinesIpc();
  registerCategoriesIpc();
  registerDistributionsIpc();
  registerEventTypesIpc();
  registerFundEventsIpc();
  registerFundEventLinesIpc();
  registerFundsIpc();
  registerIncomesIpc();
  registerLiabilitiesIpc();
  registerTransactionsIpc();
}

export default registerIpcHandlers;
