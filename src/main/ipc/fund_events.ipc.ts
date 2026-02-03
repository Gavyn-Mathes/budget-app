// src/main/ipc/fund_events.ipc.ts
import * as Shared from "../../shared/ipc/fund_events";
import * as RepoModule from "../db/repos/fund_events.repo";
import { registerZodRepoIpc } from "./common";

export function registerFundEventsIpc() {
  registerZodRepoIpc({ namespace: "fund_events", shared: Shared, repoModule: RepoModule });
}
