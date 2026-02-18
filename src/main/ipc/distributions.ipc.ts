// src/main/ipc/distributions.ipc.ts

import * as Shared from "../../shared/ipc/distributions";
import { registerZodIpc } from "./common";
import { getDb } from "../db";
import { DistributionRepo } from "../db/repos/distributions.repo";
import { DistributionsService } from "../services/distributions.service";

export function registerDistributionsIpc() {
  const db = getDb();
  const repo = new DistributionRepo(db);
  const service = new DistributionsService(db, repo);

  registerZodIpc({
    namespace: "distributions",
    shared: Shared,
    impl: service,
    responseMap: {
      UpsertMany: () => ({ ok: true }),
      DeleteOne: () => ({ ok: true }),
    },
  });
}
