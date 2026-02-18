// shared/types/liability.ts
import type { LiabilityDTO, LiabilityUpsertInputDTO, LiabilityWithBalanceDTO } from "../schemas/liability";

export type LiabilityId = LiabilityDTO["liabilityId"];
export type Liability = LiabilityDTO;
export type LiabilityUpsertInput = LiabilityUpsertInputDTO;
export type LiabilityWithBalance = LiabilityWithBalanceDTO;
