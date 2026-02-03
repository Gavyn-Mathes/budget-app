// src/main/ipc/fund_event_lines.ipc.ts
import * as Shared from "../../shared/ipc/fund_event_lines";
import * as RepoModule from "../db/repos/fund_event_lines.repo";
import { registerZodRepoIpc } from "./common";

export function registerFundEventLinesIpc() {
  registerZodRepoIpc({ namespace: "fund_event_lines", shared: Shared, repoModule: RepoModule });
}
