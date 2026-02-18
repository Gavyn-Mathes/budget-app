// src/renderer/src/components/features/budgets/useBudgetsPage.ts

import { useEffect, useMemo, useState } from "react";
import type { Budget, BudgetUpsertInput } from "../../../../../../shared/types/budget";
import type { Category } from "../../../../../../shared/types/category";
import type { Fund } from "../../../../../../shared/types/fund";
import type { Asset } from "../../../../../../shared/types/asset";
import type { BudgetLine, BudgetLineUpsertInput } from "../../../../../../shared/types/budget_line";
import type { DistributionRule } from "../../../../../../shared/types/distribution";
import { computeBudgetAllocationPlan } from "../../../../../../shared/domain/budget_line";
import { spentByCategory as computeSpentByCategory } from "../../../../../../shared/domain/transaction";
import { budgetsClient } from "../../../../api/budgets";
import { categoriesClient } from "../../../../api/categories";
import { distributionsClient } from "../../../../api/distributions";
import { fundsClient } from "../../../../api/funds";
import { assetsClient } from "../../../../api/assets";
import { incomesClient } from "../../../../api/incomes";
import { transactionsClient } from "../../../../api/transactions";
import { budgetLinesClient } from "../../../../api/budget_lines";
import { makeDraftBudget, normalizeBudgetUpsert, upsertInputFromBudget, } from "../utils/budgets.helpers";
import { currentMonthKey, isValidMonthKey } from "../../../utils/month";

type GetByMonthReq = Parameters<typeof budgetsClient.getByMonth>[0];
type UpsertReq = Parameters<typeof budgetsClient.upsert>[0];

function makeGetByMonthReq(monthKey: string): GetByMonthReq {
  return ({ budgetMonthKey: monthKey } as unknown) as GetByMonthReq;
}

function makeUpsertReq(budget: BudgetUpsertInput): UpsertReq {
  return ({ budget } as unknown) as UpsertReq;
}

export function useBudgetMonthPage() {
  const [monthKey, setMonthKey] = useState<string>(currentMonthKey());

  const [row, setRow] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distBusy, setDistBusy] = useState(false);
  const [distError, setDistError] = useState<string | null>(null);
  const [distNotice, setDistNotice] = useState<string | null>(null);
  const [incomeTransferFundId, setIncomeTransferFundId] = useState<string>("");
  const [incomeTransferAssetId, setIncomeTransferAssetId] = useState<string>("");
  const [incomeTransferAmountMinor, setIncomeTransferAmountMinor] = useState<string>("");
  const [distRulesCount, setDistRulesCount] = useState<number | null>(null);
  const [distRulesLoading, setDistRulesLoading] = useState(false);
  const [distRulesError, setDistRulesError] = useState<string | null>(null);
  const [distRules, setDistRules] = useState<DistributionRule[]>([]);
  const [incomeMonthTotalMinor, setIncomeMonthTotalMinor] = useState<number | null>(null);
  const [transactionsSpentMinor, setTransactionsSpentMinor] = useState<number>(0);
  const [spentByCategory, setSpentByCategory] = useState<Record<string, number>>({});
  const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([]);
  const [budgetLinesLoading, setBudgetLinesLoading] = useState(false);
  const [budgetLinesError, setBudgetLinesError] = useState<string | null>(null);
  const [budgetLinesNotice, setBudgetLinesNotice] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editor, setEditor] = useState<BudgetUpsertInput | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [metaError, setMetaError] = useState<string | null>(null);

  const hasBudget = useMemo(() => !!row, [row]);

  const fundsAlpha = useMemo(() => {
    return [...funds].sort((a, b) =>
      String((a as any).name ?? "").localeCompare(String((b as any).name ?? ""), undefined, { sensitivity: "base" })
    );
  }, [funds]);

  const cashAssetsByFund = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const a of assets) {
      if (String((a as any).assetType ?? "").toUpperCase() !== "CASH") continue;
      const fid = String((a as any).fundId ?? "");
      if (!map.has(fid)) map.set(fid, []);
      map.get(fid)!.push(a);
    }
    for (const [k, list] of map.entries()) {
      list.sort((a, b) =>
        String((a as any).name ?? "").localeCompare(String((b as any).name ?? ""), undefined, { sensitivity: "base" })
      );
      map.set(k, list);
    }
    return map;
  }, [assets]);

  async function refresh(targetMonthKey?: string) {
    const mk = String(targetMonthKey ?? monthKey).trim();

    if (!isValidMonthKey(mk)) {
      setRow(null);
      setError("Month must be formatted as YYYY-MM (e.g., 2026-02).");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const req = makeGetByMonthReq(mk);
      const res = await budgetsClient.getByMonth(req);
      setRow((res as any)?.budget ?? null);
    } catch (e: any) {
      setRow(null);
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setDistError(null);
    setDistNotice(null);
    refresh(monthKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey]);

  useEffect(() => {
    async function refreshMeta() {
      setMetaError(null);
      try {
        const [c, f, a] = await Promise.all([
          categoriesClient.list({} as any),
          fundsClient.list({} as any),
          assetsClient.list({} as any),
        ]);
        setCategories(c ?? []);
        setFunds(f ?? []);
        setAssets(a ?? []);
      } catch (e: any) {
        setCategories([]);
        setFunds([]);
        setAssets([]);
        setMetaError(e?.message ?? String(e));
      }
    }
    refreshMeta();
  }, []);

  useEffect(() => {
    if (!row) {
      setDistRulesCount(null);
      setDistRules([]);
      setDistRulesError(null);
      setIncomeMonthTotalMinor(null);
      setTransactionsSpentMinor(0);
      setSpentByCategory({});
      return;
    }

    const budgetId = row.budgetId;
    let alive = true;
    async function loadRules() {
      setDistRulesLoading(true);
      setDistRulesError(null);
      setDistRulesCount(null);
      setDistRules([]);
      try {
        const rules = await distributionsClient.listByBudget({ budgetId } as any);
        if (!alive) return;
        const list = Array.isArray(rules) ? rules : [];
        setDistRules(list);
        setDistRulesCount(list.length);
      } catch (e: any) {
        if (!alive) return;
        setDistRules([]);
        setDistRulesCount(null);
        setDistRulesError(e?.message ?? String(e));
      } finally {
        if (alive) setDistRulesLoading(false);
      }
    }

    loadRules();
    return () => {
      alive = false;
    };
  }, [row?.budgetId]);

  useEffect(() => {
    if (!row) {
      setIncomeMonthTotalMinor(null);
      return;
    }

    const incomeMonthKey = row.incomeMonthKey;
    let alive = true;
    async function loadIncomeTotal() {
      try {
        const incomes = await incomesClient.listByMonth({ incomeMonthKey } as any);
        if (!alive) return;
        let total = 0;
        for (const income of incomes ?? []) {
          total += Number((income as any).amount ?? 0);
        }
        setIncomeMonthTotalMinor(total);
      } catch {
        if (!alive) return;
        setIncomeMonthTotalMinor(null);
      }
    }

    loadIncomeTotal();
    return () => {
      alive = false;
    };
  }, [row?.incomeMonthKey]);

  useEffect(() => {
    if (!row) {
      setTransactionsSpentMinor(0);
      setSpentByCategory({});
      return;
    }

    const budgetMonthKey = row.budgetMonthKey;
    let alive = true;
    async function loadTransactions() {
      try {
        const tx = await transactionsClient.listByMonth({ monthKey: budgetMonthKey } as any);
        if (!alive) return;
        const list = Array.isArray(tx) ? tx : [];
        let total = 0;
        for (const item of list) {
          total += Number((item as any).amount ?? 0);
        }
        setTransactionsSpentMinor(total);
        setSpentByCategory(computeSpentByCategory(list as any));
      } catch {
        if (!alive) return;
        setTransactionsSpentMinor(0);
        setSpentByCategory({});
      }
    }

    loadTransactions();
    return () => {
      alive = false;
    };
  }, [row?.budgetMonthKey]);

  useEffect(() => {
    if (!row) {
      setBudgetLines([]);
      setBudgetLinesError(null);
      setBudgetLinesNotice(null);
      return;
    }
    void refreshBudgetLines(row.budgetId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row?.budgetId]);

  function openCreateOrEdit() {
    if (row) {
      setEditor(upsertInputFromBudget(row));
    } else {
      setEditor(makeDraftBudget(monthKey));
    }
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditor(null);
  }

  function patchEditor(patch: Partial<BudgetUpsertInput>) {
    setEditor((prev) => (prev ? ({ ...(prev as any), ...(patch as any) } as any) : prev));
  }

  async function saveEditor(capOverrideMinor?: number) {
    if (!editor) return;

    const normalized = normalizeBudgetUpsert({
      ...editor,
      ...(capOverrideMinor == null ? {} : { cap: capOverrideMinor }),
    } as BudgetUpsertInput);

    const budgetMonthKey = String((normalized as any).budgetMonthKey ?? "").trim();
    const incomeMonthKey = String((normalized as any).incomeMonthKey ?? "").trim();
    const cap = Number((normalized as any).cap ?? 0);
    const overageFundId = String((normalized as any).overageFundId ?? "").trim();
    const overageAssetId = String((normalized as any).overageAssetId ?? "").trim();

    if (!budgetMonthKey) return setError("Budget month is required (YYYY-MM).");
    if (!incomeMonthKey) return setError("Income month is required (YYYY-MM).");
    if (!isValidMonthKey(budgetMonthKey)) return setError("Budget month must be YYYY-MM (e.g., 2026-02).");
    if (!isValidMonthKey(incomeMonthKey)) return setError("Income month must be YYYY-MM (e.g., 2026-02).");
    if (!Number.isFinite(cap) || cap < 0) return setError("Cap must be a non-negative number.");
    if (!overageFundId) return setError("Overage fund is required.");
    if (!overageAssetId) {
      const cashAssets = cashAssetsByFund.get(overageFundId) ?? [];
      if (cashAssets.length > 1) {
        return setError(
          "Overage fund has multiple CASH assets. Select an overage asset."
        );
      }
    }

    setLoading(true);
    setError(null);
    try {
      const req = makeUpsertReq(normalized);
      await budgetsClient.upsert(req);

      closeEditor();

      // Follow whatever month the user saved to
      setMonthKey(budgetMonthKey);
      await refresh(budgetMonthKey);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  async function applyDistributions(mode: "SURPLUS" | "LEFTOVERS" | "ALL", force: boolean) {
    if (!row) return;
    setDistError(null);
    setDistNotice(null);
    setDistBusy(true);
    try {
      const res = await budgetsClient.applyDistributions({
        budgetMonthKey: row.budgetMonthKey,
        mode,
        force,
      });
      const createdEventIds = (res as any)?.createdEventIds ?? [];
      const budget = (res as any)?.budget ?? row;
      setRow(budget);
      if (createdEventIds.length > 0) {
        setDistNotice(`Distribution created ${createdEventIds.length} event(s).`);
      } else {
        setDistNotice("No distribution events were created.");
      }
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      setDistError(msg);
    } finally {
      setDistBusy(false);
    }
  }

  async function undoDistributions(mode: "SURPLUS" | "LEFTOVERS" | "ALL") {
    if (!row) return;

    const modeLabel =
      mode === "ALL"
        ? "all distribution events"
        : mode === "SURPLUS"
          ? "surplus distribution events"
          : "leftovers distribution events";

    const confirmed = window.confirm(
      `Undo ${modeLabel} for ${row.budgetMonthKey}? This will delete the related fund events.`
    );
    if (!confirmed) return;

    setDistError(null);
    setDistNotice(null);
    setDistBusy(true);
    try {
      const res = await budgetsClient.undoDistributions({
        budgetMonthKey: row.budgetMonthKey,
        mode,
      });
      const deletedEventIds = (res as any)?.deletedEventIds ?? [];
      const budget = (res as any)?.budget ?? row;
      setRow(budget);
      if (deletedEventIds.length > 0) {
        setDistNotice(`Undo completed. Deleted ${deletedEventIds.length} event(s).`);
      } else {
        setDistNotice("Undo completed. No matching distribution events were found.");
      }
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      setDistError(msg);
    } finally {
      setDistBusy(false);
    }
  }

  async function transferIncomeToSpending() {
    if (!row) return;

    const rawAmount = String(incomeTransferAmountMinor ?? "").trim();
    let amountMinor: number | null = null;
    if (rawAmount.length > 0) {
      const parsed = Number(rawAmount);
      if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
        setDistError("Transfer amount must be a positive integer (minor units).");
        return;
      }
      amountMinor = parsed;
    }

    setDistError(null);
    setDistNotice(null);
    setDistBusy(true);
    try {
      const res = await budgetsClient.transferIncomeToSpending({
        budgetMonthKey: row.budgetMonthKey,
        incomeFundId: incomeTransferFundId || null,
        incomeAssetId: incomeTransferAssetId || null,
        amountMinor,
      });
      const transferred = Number((res as any)?.amountMinor ?? 0);
      setDistNotice(
        `Income transfer posted (${transferred} minor units).`
      );
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      setDistError(msg);
    } finally {
      setDistBusy(false);
    }
  }

  async function refreshBudgetLines(targetBudgetId?: string) {
    const budgetId = String(targetBudgetId ?? row?.budgetId ?? "").trim();
    if (!budgetId) {
      setBudgetLines([]);
      setBudgetLinesError(null);
      return;
    }

    setBudgetLinesLoading(true);
    setBudgetLinesError(null);
    try {
      const lines = await budgetLinesClient.listByBudget({ budgetId } as any);
      setBudgetLines(lines ?? []);
    } catch (e: any) {
      setBudgetLines([]);
      setBudgetLinesError(e?.message ?? String(e));
    } finally {
      setBudgetLinesLoading(false);
    }
  }

  async function upsertBudgetLine(line: BudgetLineUpsertInput) {
    if (!row) return;
    setBudgetLinesError(null);
    setBudgetLinesNotice(null);

    const mergedByCategory = new Map<string, BudgetLine | BudgetLineUpsertInput>();
    for (const existing of budgetLines) mergedByCategory.set(existing.categoryId, existing);
    mergedByCategory.set(line.categoryId, line);
    const mergedLines: Array<
      Pick<BudgetLine, "categoryId" | "allocationType" | "fixedAmount" | "percent">
    > = [...mergedByCategory.values()].map((x) => ({
      categoryId: x.categoryId,
      allocationType: x.allocationType,
      fixedAmount: x.fixedAmount,
      percent: x.percent,
    }));

    if (line.allocationType === "FIXED") {
      const fixedAmountMinor = Math.max(0, Math.round(Number(line.fixedAmount ?? 0)));
      const linesWithoutCurrent = mergedLines.filter(
        (candidate) => candidate.categoryId !== line.categoryId
      );
      const withoutCurrentPlan = computeBudgetAllocationPlan(
        linesWithoutCurrent,
        Number(incomeMonthTotalMinor ?? 0),
        Number(row.cap ?? 0)
      );
      if (fixedAmountMinor > withoutCurrentPlan.remainingMinor) {
        const overBy = fixedAmountMinor - withoutCurrentPlan.remainingMinor;
        setBudgetLinesError(
          `Fixed allocation exceeds left to allocate by ${overBy} minor units.`
        );
        return;
      }
    }

    const totalPercent = mergedLines
      .filter((x) => x.allocationType === "PERCENT")
      .reduce((sum, x) => sum + Number(x.percent ?? 0), 0);
    if (totalPercent > 1 + 1e-9) {
      setBudgetLinesError("Category allocation percentages exceed 100% of remaining pool.");
      return;
    }

    const localPlan = computeBudgetAllocationPlan(
      mergedLines,
      Number(incomeMonthTotalMinor ?? 0),
      Number(row.cap ?? 0)
    );
    if (localPlan.overAllocated) {
      const overBy = Math.abs(localPlan.remainingMinor);
      setBudgetLinesError(
        `Category allocations exceed the available allocation pool by ${overBy} minor units.`
      );
      return;
    }

    setBudgetLinesLoading(true);
    try {
      await budgetLinesClient.upsertMany({
        budgetId: row.budgetId,
        lines: [{ ...line, budgetId: row.budgetId }],
      } as any);
      await refreshBudgetLines(row.budgetId);
      setBudgetLinesNotice("Category allocation saved.");
    } catch (e: any) {
      setBudgetLinesError(e?.message ?? String(e));
    } finally {
      setBudgetLinesLoading(false);
    }
  }

  async function deleteBudgetLine(categoryId: string) {
    if (!row) return;
    const cid = String(categoryId ?? "").trim();
    if (!cid) return;
    setBudgetLinesError(null);
    setBudgetLinesNotice(null);
    setBudgetLinesLoading(true);
    try {
      await budgetLinesClient.deleteOne({
        budgetId: row.budgetId,
        categoryId: cid,
      } as any);
      await refreshBudgetLines(row.budgetId);
      setBudgetLinesNotice("Category allocation deleted.");
    } catch (e: any) {
      setBudgetLinesError(e?.message ?? String(e));
    } finally {
      setBudgetLinesLoading(false);
    }
  }

  return {
    monthKey,
    setMonthKey,

    row,
    hasBudget,
    loading,
    error,
    distBusy,
    distError,
    distNotice,
    incomeTransferFundId,
    setIncomeTransferFundId,
    incomeTransferAssetId,
    setIncomeTransferAssetId,
    incomeTransferAmountMinor,
    setIncomeTransferAmountMinor,
    distRulesCount,
    distRulesLoading,
    distRulesError,
    distRules,
    incomeMonthTotalMinor,
    transactionsSpentMinor,
    spentByCategory,
    budgetLines,
    budgetLinesLoading,
    budgetLinesError,
    budgetLinesNotice,
    metaError,

    refresh,

    categories,
    funds: fundsAlpha,
    cashAssetsByFund,

    editorOpen,
    editor,
    openCreateOrEdit,
    closeEditor,
    patchEditor,
    saveEditor,

    applyDistributions,
    undoDistributions,
    transferIncomeToSpending,
    refreshBudgetLines,
    upsertBudgetLine,
    deleteBudgetLine,
  };
}
