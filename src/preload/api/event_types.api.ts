// preload/api/event_types.api.ts
import * as Shared from "../../shared/ipc/event_types";
import { makeApiModule } from "./common";

export const eventTypesApi = makeApiModule(Shared);
