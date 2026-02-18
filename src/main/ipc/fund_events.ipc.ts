// src/main/ipc/fund_events.ipc.ts

import * as Shared from "../../shared/ipc/fund_events";
import { registerZodIpc } from "./common";
import { getDb } from "../db";
import { FundEventRepo } from "../db/repos/fund_events.repo";
import { AssetsRepo } from "../db/repos/assets.repo";
import { FundEventsService } from "../services/fund_events.service";

export function registerFundEventsIpc() {
  const db = getDb();
  const repo = new FundEventRepo(db);
  const assetsRepo = new AssetsRepo(db);
  const service = new FundEventsService(db, repo, assetsRepo);

  registerZodIpc({
    namespace: "fund_events",
    shared: Shared,
    impl: service,

    // Only needed if your shared *Res are envelopes like { ok:true, event: ... }.
    // If your UpsertRes is { ok:true, fundEvent: FundEventWithLinesSchema }, keep the wrapper.
    responseMap: {
      GetById: (data) => ({ data }),
      Upsert: (data) => ({ ok: true, data }),
      MoveAssetToAccount: (data) => ({ ok: true, data }),
      Delete: () => ({ ok: true }),
    },
  });
}
