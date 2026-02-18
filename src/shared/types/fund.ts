// shared/types/fund.ts
import type { FundDTO, FundUpsertInputDTO, FundWithTotalsDTO } from "../schemas/fund";

export type FundId = FundDTO["fundId"];
export type Fund = FundDTO;
export type FundUpsertInput = FundUpsertInputDTO;
export type FundWithTotals = FundWithTotalsDTO;