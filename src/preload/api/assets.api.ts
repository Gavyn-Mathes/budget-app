// preload/api/assets.api.ts
import * as Shared from "../../shared/ipc/assets";
import { makeZodApiModule } from "./common";

export const assetsApi = makeZodApiModule(Shared);
