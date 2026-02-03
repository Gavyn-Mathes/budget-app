// src/main/ipc/liabilities.ipc.ts
import * as Shared from "../../shared/ipc/liabilities";
import * as RepoModule from "../db/repos/liabilities.repo";
import { registerZodRepoIpc } from "./common";

export function registerLiabilitiesIpc() {
  registerZodRepoIpc({ namespace: "liabilities", shared: Shared, repoModule: RepoModule });
}
