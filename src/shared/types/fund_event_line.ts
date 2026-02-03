// shared/types/fund_event_line.ts
import type { Id, IsoTimestamp, Money } from "./common";
import type { FundEventId } from "./fund_event";
import type { AssetId } from "./asset";
import type { LiabilityId } from "./liability";

export type FundEventLineId = Id;

type FundEventLineBase = {
  lineId: FundEventLineId;
  eventId: FundEventId;

  unitPrice: Money | null; // >= 0 if present
  fee: Money | null;       // >= 0 if present
  notes: string | null;

  createdAt: IsoTimestamp;
  updatedAt: IsoTimestamp;
};

export type AssetFundEventLine = FundEventLineBase & {
  assetId: AssetId;
  liabilityId: null;

  quantityDelta: number;   // NOT NULL when assetId is set
  balanceDelta: null;      // must be NULL
};

export type LiabilityFundEventLine = FundEventLineBase & {
  assetId: null;
  liabilityId: LiabilityId;

  quantityDelta: null;     // must be NULL
  balanceDelta: Money;     // NOT NULL when liabilityId is set
};

export type FundEventLine = AssetFundEventLine | LiabilityFundEventLine;

export interface FundEventWithLines {
  event: import("./fund_event").FundEvent;
  lines: FundEventLine[];
}
