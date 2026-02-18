// shared/types/fund_event_line.ts
import type {
  FundEventLineDTO,
  FundEventLineUpsertInputDTO,
  FundEventWithLinesDTO,
  FundEventWithLinesUpsertInputDTO,
} from "../schemas/fund_event_line";

export type FundEventLineId = FundEventLineDTO["lineId"];
export type FundEventLine = FundEventLineDTO;
export type FundEventLineUpsertInput = FundEventLineUpsertInputDTO;
export type FundEventWithLines = FundEventWithLinesDTO;
export type FundEventWithLinesUpsertInput = FundEventWithLinesUpsertInputDTO;