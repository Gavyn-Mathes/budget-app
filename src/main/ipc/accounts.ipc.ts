// src/main/ipc/accounts.ipc.ts

import * as Shared from "../../shared/ipc/accounts";
import { registerZodIpc } from "./common";
import { getDb } from "../db";
import { AccountsRepo } from "../db/repos/accounts.repo";
import { AccountsService } from "../services/accounts.service";

export function registerAccountsIpc() {
  const db = getDb();
  const repo = new AccountsRepo(db);
  const service = new AccountsService(db, repo);

  registerZodIpc({
    namespace: "accounts",
    shared: Shared,
    impl: service,
    responseMap: {
      Upsert: (account) => ({ ok: true, account }),
      Delete: () => ({ ok: true }),
    },
  });
}
