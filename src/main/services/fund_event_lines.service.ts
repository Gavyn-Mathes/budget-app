// src/main/services/fund_event_lines.service.ts

import type { FundEventLine } from "../../shared/types/fund_event_line";
import { FundEventLineRepo } from "../db/repos/fund_event_lines.repo";

export class FundEventLinesService {
  constructor(private readonly repo: FundEventLineRepo) {}

  listByEvent(eventId: string): FundEventLine[] {
    return this.repo.listByEvent(eventId);
  }

  listByAsset(assetId: string): FundEventLine[] {
    return this.repo.listByAsset(assetId);
  }

  listByLiability(liabilityId: string): FundEventLine[] {
    return this.repo.listByLiability(liabilityId);
  }
}
