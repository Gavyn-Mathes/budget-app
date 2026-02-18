// preload/api/incomes.api.ts
import * as Shared from "../../shared/ipc/incomes";
import { makeApiModule } from "./common";

export const incomesApi = makeApiModule(Shared);
