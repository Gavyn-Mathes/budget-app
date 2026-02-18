// src/main/ipc/funds.ipc.ts

import * as Shared from "../../shared/ipc/funds";
import { registerZodIpc } from "./common";
import { getDb } from "../db";
import { FundsRepo } from "../db/repos/funds.repo";
import { FundsService } from "../services/funds.service";

export function registerFundsIpc() {
  const db = getDb();
  const repo = new FundsRepo(db);
  const service = new FundsService(db, repo);

  registerZodIpc({
    namespace: "funds",
    shared: Shared,
    impl: service,
    responseMap: {
      Upsert: (fund) => ({ ok: true, fund }),
      Delete: () => ({ ok: true }),
    },
  });
}
