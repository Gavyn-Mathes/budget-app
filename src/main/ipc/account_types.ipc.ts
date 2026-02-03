// main/ipc/account_types.ipc.ts
import * as Shared from "../../shared/ipc/account_types";
import * as RepoModule from "../db/repos/account_types.repo";
import { registerZodRepoIpc } from "./common";

export function registerAccountTypesIpc() { 
  registerZodRepoIpc({ namespace: "account_types", shared: Shared, repoModule: RepoModule, }); 
}