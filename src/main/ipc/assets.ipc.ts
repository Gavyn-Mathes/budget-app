// src/main/ipc/assets.ipc.ts
import * as Shared from "../../shared/ipc/assets";
import * as RepoModule from "../db/repos/assets.repo";
import { registerZodRepoIpc } from "./common";

export function registerAssetsIpc() {
  registerZodRepoIpc({ namespace: "assets", shared: Shared, repoModule: RepoModule });
}
