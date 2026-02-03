// preload/api/incomes.api.ts
import * as Shared from "../../shared/ipc/incomes";
import { makeZodApiModule } from "./common";

export const incomesApi = makeZodApiModule(Shared);
