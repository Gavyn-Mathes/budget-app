// src/main/ipc/event_types.ipc.ts

import * as Shared from "../../shared/ipc/event_types";
import { registerZodIpc } from "./common";
import { getDb } from "../db";
import { EventTypesRepo } from "../db/repos/event_types.repo";
import { EventTypesService } from "../services/event_types.service";

export function registerEventTypesIpc() {
  const db = getDb();
  const repo = new EventTypesRepo(db);
  const service = new EventTypesService(db, repo);

  registerZodIpc({
    namespace: "event_types",
    shared: Shared,
    impl: service,
    argMap: {
      Create: (req) => [{ eventType: req.eventType }],
      Update: (req) => [
        {
          eventTypeId: req.eventTypeId,
          eventType: { eventType: req.eventType },
        },
      ],
    },
    responseMap: {
      GetById: (data) => ({ data }),
      Create: (data) => ({ data }),
      Update: (data) => ({ data }),
      Delete: () => ({ ok: true }),
    },
  });
}
