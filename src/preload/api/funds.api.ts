// preload/api/funds.api.ts
import * as Shared from "../../shared/ipc/funds";
import { makeZodApiModule } from "./common";

export const fundsApi = makeZodApiModule(Shared);
