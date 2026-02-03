// preload/api/fund_event_lines.api.ts
import * as Shared from "../../shared/ipc/fund_event_lines";
import { makeZodApiModule } from "./common";

export const fundEventLinesApi = makeZodApiModule(Shared);
