// preload/api/budget_lines.api.ts
import * as Shared from "../../shared/ipc/budget_lines";
import { makeApiModule } from "./common";

export const budgetLinesApi = makeApiModule(Shared);
