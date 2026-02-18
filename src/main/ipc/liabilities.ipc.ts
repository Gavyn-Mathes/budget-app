// src/main/ipc/liabilities.ipc.ts

import * as Shared from "../../shared/ipc/liabilities";
import { registerZodIpc } from "./common";
import { getDb } from "../db";
import { LiabilitiesRepo } from "../db/repos/liabilities.repo";
import { LiabilityAccountMovesRepo } from "../db/repos/liability_account_moves.repo";
import { LiabilitiesService } from "../services/liabilities.service";

export function registerLiabilitiesIpc() {
  const db = getDb();
  const repo = new LiabilitiesRepo(db);
  const movesRepo = new LiabilityAccountMovesRepo(db);
  const service = new LiabilitiesService(db, repo, movesRepo);

  registerZodIpc({
    namespace: "liabilities",
    shared: Shared,
    impl: service,
    responseMap: {
      Upsert: (liability) => ({ ok: true, liability }),
      MoveAccount: (data) => ({ ok: true, data }),
      Delete: () => ({ ok: true }),
    },
  });
}
