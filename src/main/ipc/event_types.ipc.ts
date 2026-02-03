// src/main/ipc/event_types.ipc.ts
import * as Shared from "../../shared/ipc/event_types";
import * as RepoModule from "../db/repos/event_types.repo";
import { registerZodRepoIpc } from "./common";

export function registerEventTypesIpc() {
  registerZodRepoIpc({ namespace: "event_types", shared: Shared, repoModule: RepoModule });
}
