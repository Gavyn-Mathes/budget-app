// preload/api/budget_lines.api.ts
import * as Shared from "../../shared/ipc/budget_lines";
import { makeZodApiModule } from "./common";

export const budgetLinesApi = makeZodApiModule(Shared);
