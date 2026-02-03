// src/preload/api/index.ts
import { accountTypesApi } from "./account_types.api";
import { accountsApi } from "./accounts.api";
import { assetsApi } from "./assets.api";
import { budgetLinesApi } from "./budget_lines.api";
import { budgetsApi } from "./budgets.api";
import { categoriesApi } from "./categories.api";
import { distributionsApi } from "./distributions.api";
import { eventTypesApi } from "./event_types.api";
import { fundEventLinesApi } from "./fund_event_lines.api";
import { fundEventsApi } from "./fund_events.api";
import { fundsApi } from "./funds.api";
import { incomesApi } from "./incomes.api";
import { liabilitiesApi } from "./liabilities.api";
import { transactionsApi } from "./transactions.api";

export const api = Object.freeze({
  accountTypes: accountTypesApi,
  accounts: accountsApi,
  assets: assetsApi,
  budgetLines: budgetLinesApi,
  budgets: budgetsApi,
  categories: categoriesApi,
  distributions: distributionsApi,
  eventTypes: eventTypesApi,
  fundEventLines: fundEventLinesApi,
  fundEvents: fundEventsApi,
  funds: fundsApi,
  incomes: incomesApi,
  liabilities: liabilitiesApi,
  transactions: transactionsApi,
});

export type PreloadApi = typeof api;
