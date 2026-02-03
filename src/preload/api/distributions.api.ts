// preload/api/distributions.api.ts
import * as Shared from "../../shared/ipc/distributions";
import { makeZodApiModule } from "./common";

export const distributionsApi = makeZodApiModule(Shared);
