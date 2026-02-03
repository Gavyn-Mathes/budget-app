// src/main/ipc/distributions.ipc.ts
import * as Shared from "../../shared/ipc/distributions";
import * as RepoModule from "../db/repos/distributions.repo";
import { registerZodRepoIpc } from "./common";

export function registerDistributionsIpc() {
  registerZodRepoIpc({ namespace: "distributions", shared: Shared, repoModule: RepoModule });
}
