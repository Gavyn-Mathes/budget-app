// src/main/ipc/transactions.ipc.ts
import * as Shared from "../../shared/ipc/transactions";
import * as RepoModule from "../db/repos/transactions.repo";
import { registerZodRepoIpc } from "./common";

export function registerTransactionsIpc() {
  registerZodRepoIpc({ namespace: "transactions", shared: Shared, repoModule: RepoModule });
}
