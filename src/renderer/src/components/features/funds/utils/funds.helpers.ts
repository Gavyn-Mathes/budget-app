// src/renderer/src/components/features/funds/funds.helpers.ts
import type { Fund, FundUpsertInput } from "../../../../../../shared/types/fund";

export function makeDraftFund(): FundUpsertInput {
  return {
    name: "",
    description: null,
  } as FundUpsertInput;
}

export function upsertInputFromFund(fund: Fund): FundUpsertInput {
  return {
    fundId: fund.fundId,
    name: fund.name,
    description: fund.description ?? null,
  } as FundUpsertInput;
}

export function normalizeFundUpsert(input: FundUpsertInput): FundUpsertInput {
  const name = String((input as any).name ?? "").trim();
  const descRaw = (input as any).description;

  const description =
    descRaw == null ? null : String(descRaw).trim() ? String(descRaw).trim() : null;

  return {
    ...(input as any),
    name,
    description,
  } as FundUpsertInput;
}
