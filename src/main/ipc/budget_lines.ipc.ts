// src/main/ipc/budget_lines.ipc.ts
import * as Shared from "../../shared/ipc/budget_lines";
import * as RepoModule from "../db/repos/budget_lines.repo";
import { registerZodRepoIpc } from "./common";

export function registerBudgetLinesIpc() {
  registerZodRepoIpc({ namespace: "budget_lines", shared: Shared, repoModule: RepoModule });
}
