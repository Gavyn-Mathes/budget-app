// preload/api/budgets.api.ts
import * as Shared from "../../shared/ipc/budgets";
import { makeZodApiModule } from "./common";

export const budgetsApi = makeZodApiModule(Shared);
