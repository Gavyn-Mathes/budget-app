// src/main/ipc/categories.ipc.ts
import * as Shared from "../../shared/ipc/categories";
import * as RepoModule from "../db/repos/categories.repo";
import { registerZodRepoIpc } from "./common";

export function registerCategoriesIpc() {
  registerZodRepoIpc({ namespace: "categories", shared: Shared, repoModule: RepoModule });
}
