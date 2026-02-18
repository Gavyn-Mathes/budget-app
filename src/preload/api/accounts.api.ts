// preload/api/accounts.api.ts
import * as Shared from "../../shared/ipc/accounts";
import { makeApiModule } from "./common";

export const accountsApi = makeApiModule(Shared);
