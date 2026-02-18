// shared/types/distribution.ts
import type { DistributionRuleDTO, DistributionRuleUpsertInputDTO } from "../schemas/distribution";

export type DistributionRuleId = DistributionRuleDTO["distributionRuleId"];
export type DistributionRule = DistributionRuleDTO;
export type DistributionRuleUpsertInput = DistributionRuleUpsertInputDTO;
