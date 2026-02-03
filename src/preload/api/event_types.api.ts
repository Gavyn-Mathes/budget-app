// preload/api/event_types.api.ts
import * as Shared from "../../shared/ipc/event_types";
import { makeZodApiModule } from "./common";

export const eventTypesApi = makeZodApiModule(Shared);
