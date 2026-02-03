// src/main/ipc/funds.ipc.ts
import * as Shared from "../../shared/ipc/funds";
import * as RepoModule from "../db/repos/funds.repo";
import { registerZodRepoIpc } from "./common";

export function registerFundsIpc() {
  registerZodRepoIpc({ namespace: "funds", shared: Shared, repoModule: RepoModule });
}
