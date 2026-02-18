// src/main/ipc/fund_event_lines.ipc.ts

import * as Shared from "../../shared/ipc/fund_event_lines";
import { registerZodIpc } from "./common";
import { getDb } from "../db";
import { FundEventLineRepo } from "../db/repos/fund_event_lines.repo";
import { FundEventLinesService } from "../services/fund_event_lines.service";

export function registerFundEventLinesIpc() {
  const db = getDb();
  const repo = new FundEventLineRepo(db);
  const service = new FundEventLinesService(repo);

  registerZodIpc({
    namespace: "fund_event_lines",
    shared: Shared,
    impl: service,
  });
}
