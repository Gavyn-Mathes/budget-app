// src/main/ipc/categories.ipc.ts

import * as Shared from "../../shared/ipc/categories";
import { registerZodIpc } from "./common";
import { getDb } from "../db";
import { CategoriesRepo } from "../db/repos/categories.repo";
import { CategoriesService } from "../services/categories.service";

export function registerCategoriesIpc() {
  const db = getDb();
  const repo = new CategoriesRepo(db);
  const service = new CategoriesService(db, repo);

  registerZodIpc({
    namespace: "categories",
    shared: Shared,
    impl: service,
    responseMap: {
      Upsert: (category) => ({ ok: true, category }),
      Delete: () => ({ ok: true }),
    },
  });
}
