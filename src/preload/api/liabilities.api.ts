// preload/api/liabilities.api.ts
import * as Shared from "../../shared/ipc/liabilities";
import { makeApiModule } from "./common";

export const liabilitiesApi = makeApiModule(Shared);
