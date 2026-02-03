// src/main/ipc/incomes.ipc.ts
import * as Shared from "../../shared/ipc/incomes";
import * as RepoModule from "../db/repos/incomes.repo";
import { registerZodRepoIpc } from "./common";

export function registerIncomesIpc() {
  registerZodRepoIpc({ namespace: "incomes", shared: Shared, repoModule: RepoModule });
}
