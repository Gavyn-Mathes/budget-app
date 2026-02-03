// preload/api/account_types.api.ts
import * as Shared from "../../shared/ipc/account_types";
import { makeZodApiModule } from "./common";

export const accountTypesApi = makeZodApiModule(Shared);
