// src/renderer/src/components/features/budgets/budgets.helpers.ts

import type { Budget, BudgetUpsertInput } from "../../../../../../shared/types/budget";

export function makeDraftBudget(monthKey: string): BudgetUpsertInput {
  return {
    budgetMonthKey: monthKey,
    incomeMonthKey: monthKey,
    cap: 0,
    notes: null,
    spendingFundId: null,
    spendingAssetId: null,
    overageFundId: null,
    overageAssetId: null,
    surplusHandled: false,
    leftoversHandled: false,
  } as BudgetUpsertInput;
}

export function upsertInputFromBudget(b: Budget): BudgetUpsertInput {
  return {
    budgetId: b.budgetId,
    budgetMonthKey: b.budgetMonthKey,
    incomeMonthKey: b.incomeMonthKey,
    cap: b.cap,
    notes: b.notes ?? null,
    spendingFundId: (b as any).spendingFundId ?? null,
    spendingAssetId: (b as any).spendingAssetId ?? null,
    overageFundId: (b as any).overageFundId ?? null,
    overageAssetId: (b as any).overageAssetId ?? null,
    surplusHandled: (b as any).surplusHandled ?? false,
    leftoversHandled: (b as any).leftoversHandled ?? false,
  } as BudgetUpsertInput;
}

export function normalizeBudgetUpsert(input: BudgetUpsertInput): BudgetUpsertInput {
  const budgetMonthKey = String((input as any).budgetMonthKey ?? "").trim();
  const incomeMonthKey = String((input as any).incomeMonthKey ?? "").trim();

  const capNum = Number((input as any).cap ?? 0);

  const notesRaw = (input as any).notes;
  const notes =
    notesRaw == null ? null : String(notesRaw).trim() ? String(notesRaw).trim() : null;

  return {
    ...(input as any),
    budgetMonthKey,
    incomeMonthKey,
    cap: Number.isFinite(capNum) ? Math.max(0, Math.round(capNum)) : 0,
    notes,
    spendingFundId:
      (input as any).spendingFundId == null
        ? null
        : String((input as any).spendingFundId).trim() || null,
    spendingAssetId:
      (input as any).spendingAssetId == null
        ? null
        : String((input as any).spendingAssetId).trim() || null,
    overageFundId:
      (input as any).overageFundId == null
        ? null
        : String((input as any).overageFundId).trim() || null,
    overageAssetId:
      (input as any).overageAssetId == null
        ? null
        : String((input as any).overageAssetId).trim() || null,
  } as BudgetUpsertInput;
}
