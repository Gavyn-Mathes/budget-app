// preload/api/distributions.api.ts
import * as Shared from "../../shared/ipc/distributions";
import { makeApiModule } from "./common";

export const distributionsApi = makeApiModule(Shared);
