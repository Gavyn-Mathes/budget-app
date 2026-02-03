// src/main/ipc/accounts.ipc.ts
import * as Shared from "../../shared/ipc/accounts";
import * as RepoModule from "../db/repos/accounts.repo";
import { registerZodRepoIpc } from "./common";

export function registerAccountsIpc() {
  registerZodRepoIpc({ namespace: "accounts", shared: Shared, repoModule: RepoModule });
}
