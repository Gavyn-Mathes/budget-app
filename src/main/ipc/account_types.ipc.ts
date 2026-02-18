// src/main/ipc/account_types.ipc.ts

import * as Shared from "../../shared/ipc/account_types";
import { registerZodIpc } from "./common";
import { getDb } from "../db";
import { AccountTypesRepo } from "../db/repos/account_types.repo";
import { AccountTypesService } from "../services/account_types.service";

export function registerAccountTypesIpc() {
  const db = getDb();
  const repo = new AccountTypesRepo(db);
  const service = new AccountTypesService(db, repo);

  registerZodIpc({
    namespace: "account_types",
    shared: Shared,
    impl: service,

    responseMap: {
      Upsert: (accountType) => ({ ok: true, accountType }),
      Delete: () => ({ ok: true }),
    },
  });
}
