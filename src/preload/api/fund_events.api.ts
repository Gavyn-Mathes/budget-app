// preload/api/fund_events.api.ts
import * as Shared from "../../shared/ipc/fund_events";
import { makeZodApiModule } from "./common";

export const fundEventsApi = makeZodApiModule(Shared);
