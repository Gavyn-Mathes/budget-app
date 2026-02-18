// preload/api/assets.api.ts
import * as Shared from "../../shared/ipc/assets";
import { makeApiModule } from "./common";

export const assetsApi = makeApiModule(Shared);
