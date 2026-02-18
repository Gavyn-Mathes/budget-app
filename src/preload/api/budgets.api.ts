// preload/api/budgets.api.ts
import * as Shared from "../../shared/ipc/budgets";
import { makeApiModule } from "./common";

export const budgetsApi = makeApiModule(Shared);
