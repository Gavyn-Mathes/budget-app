// src/main/ipc/assets.ipc.ts
import * as Shared from "../../shared/ipc/assets";
import { registerZodIpc } from "./common";
import { getDb } from "../db";
import { AssetsRepo } from "../db/repos/assets.repo";
import { AssetsService } from "../services/assets.service";

export function registerAssetsIpc() {
  const db = getDb();
  const repo = new AssetsRepo(db);
  const service = new AssetsService(db, repo);

  registerZodIpc({
    namespace: "assets",
    shared: Shared,
    impl: service,
    responseMap: {
      Upsert: (asset) => ({ ok: true, asset }),
      Delete: () => ({ ok: true }),
    },
  });
}
