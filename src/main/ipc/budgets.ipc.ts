// src/main/ipc/budgets.ipc.ts
import * as Shared from "../../shared/ipc/budgets";
import * as RepoModule from "../db/repos/budgets.repo";
import { registerZodRepoIpc } from "./common";

export function registerBudgetsIpc() {
  registerZodRepoIpc({ namespace: "budgets", shared: Shared, repoModule: RepoModule });
}
