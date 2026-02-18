// shared/types/income.ts
import type {
  IncomeDTO,
  IncomeMonthDTO,
  IncomeMonthUpsertInputDTO,
  IncomeUpsertInputDTO,
} from "../schemas/income";

export type IncomeId = IncomeDTO["incomeId"];

export type IncomeMonth = IncomeMonthDTO;
export type IncomeMonthUpsertInput = IncomeMonthUpsertInputDTO;
export type Income = IncomeDTO;

/**
 * What UI sends to main for create/update.
 */
export type IncomeUpsertInput = IncomeUpsertInputDTO;
