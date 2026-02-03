// preload/api/liabilities.api.ts
import * as Shared from "../../shared/ipc/liabilities";
import { makeZodApiModule } from "./common";

export const liabilitiesApi = makeZodApiModule(Shared);
