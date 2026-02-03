// preload/api/accounts.api.ts
import * as Shared from "../../shared/ipc/accounts";
import { makeZodApiModule } from "./common";

export const accountsApi = makeZodApiModule(Shared);
