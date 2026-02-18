// preload/api/fund_events.api.ts
import * as Shared from "../../shared/ipc/fund_events";
import { makeApiModule } from "./common";

export const fundEventsApi = makeApiModule(Shared);
