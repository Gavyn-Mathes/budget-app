// shared/types/fund.ts
import type { Id, IsoTimestamp } from "./common";

export type FundId = Id;

export interface Fund {
  fundId: FundId;
  name: string;
  description: string | null;
  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
}
