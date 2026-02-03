// preload/api/transactions.api.ts
import * as Shared from "../../shared/ipc/transactions";
import { makeZodApiModule } from "./common";

export const transactionsApi = makeZodApiModule(Shared);
