// src/renderer/src/components/features/budgets/distributions/hooks/useDistributionsPage.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Budget } from "../../../../../../../shared/types/budget";
import type { Category } from "../../../../../../../shared/types/category";
import type { Fund } from "../../../../../../../shared/types/fund";
import type { Asset } from "../../../../../../../shared/types/asset";
import type { DistributionRule, DistributionRuleUpsertInput } from "../../../../../../../shared/types/distribution";
import { budgetsClient } from "../../../../../api/budgets";
import { categoriesClient } from "../../../../../api/categories";
import { fundsClient } from "../../../../../api/funds";
import { assetsClient } from "../../../../../api/assets";
import { distributionsClient } from "../../../../../api/distributions";
import { currentMonthKey } from "../../../../utils/month";
import { isCashAsset } from "../../../../../../../shared/types/asset";

function errToMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

export function useDistributionsPage() {
  const [budgetMonthKey, setBudgetMonthKey] = useState<string>(currentMonthKey());

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  const [rules, setRules] = useState<DistributionRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copyBusy, setCopyBusy] = useState(false);

  const budgetsSorted = useMemo(() => {
    return [...budgets].sort((a, b) => a.budgetMonthKey.localeCompare(b.budgetMonthKey));
  }, [budgets]);

  const budget = useMemo(() => {
    return budgets.find((b) => b.budgetMonthKey === budgetMonthKey) ?? null;
  }, [budgets, budgetMonthKey]);

  const cashAssetsByFund = useMemo(() => {
    const map = new Map<string, Asset[]>();
    for (const a of assets) {
      if (!isCashAsset(a)) continue;
      const fid = String(a.fundId ?? "");
      if (!map.has(fid)) map.set(fid, []);
      map.get(fid)!.push(a);
    }
    for (const [k, list] of map.entries()) {
      list.sort((x, y) => String(x.name ?? "").localeCompare(String(y.name ?? ""), undefined, { sensitivity: "base" }));
      map.set(k, list);
    }
    return map;
  }, [assets]);

  const refreshMeta = useCallback(async () => {
    setMetaLoading(true);
    setMetaError(null);
    try {
      const [b, c, f, a] = await Promise.all([
        budgetsClient.list({} as any),
        categoriesClient.list({} as any),
        fundsClient.list({} as any),
        assetsClient.list({} as any),
      ]);
      setBudgets(b ?? []);
      setCategories(c ?? []);
      setFunds(f ?? []);
      setAssets(a ?? []);
    } catch (e) {
      setBudgets([]);
      setCategories([]);
      setFunds([]);
      setAssets([]);
      setMetaError(errToMessage(e));
    } finally {
      setMetaLoading(false);
    }
  }, []);

  const refreshRules = useCallback(
    async (budgetId?: string) => {
      const id = budgetId ?? budget?.budgetId ?? "";
      if (!id) {
        setRules([]);
        return;
      }

      setRules([]);
      setLoading(true);
      setError(null);
      try {
        const res = await distributionsClient.listByBudget({ budgetId: id } as any);
        setRules(res ?? []);
      } catch (e) {
        setRules([]);
        setError(errToMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [budget?.budgetId]
  );

  useEffect(() => {
    refreshMeta();
  }, [refreshMeta]);

  useEffect(() => {
    setNotice(null);
    setError(null);
    if (!budget) {
      setRules([]);
      return;
    }
    refreshRules(budget.budgetId);
  }, [budget?.budgetId, refreshRules]);

  const upsertRule = useCallback(
    async (input: DistributionRuleUpsertInput) => {
      if (!budget) {
        setError("Select a budget month first.");
        return;
      }

      setLoading(true);
      setError(null);
      setNotice(null);
      try {
        const rule: DistributionRuleUpsertInput = {
          ...input,
          budgetId: budget.budgetId,
        };
        await distributionsClient.upsertMany({ budgetId: budget.budgetId, rules: [rule] } as any);
        await refreshRules(budget.budgetId);
        setNotice(input.distributionRuleId ? "Distribution rule updated." : "Distribution rule created.");
      } catch (e) {
        setError(errToMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [budget, refreshRules]
  );

  const deleteRule = useCallback(
    async (distributionRuleId: string) => {
      const id = String(distributionRuleId ?? "").trim();
      if (!id) return;
      if (!budget) {
        setError("Select a budget month first.");
        return;
      }

      setLoading(true);
      setError(null);
      setNotice(null);
      try {
        await distributionsClient.deleteOne({ distributionRuleId: id } as any);
        await refreshRules(budget.budgetId);
        setNotice("Distribution rule deleted.");
      } catch (e) {
        setError(errToMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [budget, refreshRules]
  );

  const copyFromMonth = useCallback(
    async (sourceMonthKey: string) => {
      if (!budget) {
        setError("Select a budget month first.");
        return;
      }
      const sourceBudget = budgets.find((b) => b.budgetMonthKey === sourceMonthKey);
      if (!sourceBudget) {
        setError(`No budget found for ${sourceMonthKey}.`);
        return;
      }

      setCopyBusy(true);
      setError(null);
      setNotice(null);
      try {
        const sourceRules = await distributionsClient.listByBudget({
          budgetId: sourceBudget.budgetId,
        } as any);

        const mapped: DistributionRuleUpsertInput[] = (sourceRules ?? []).map((r) => ({
          budgetId: budget.budgetId,
          fundId: r.fundId,
          assetId: r.assetId ?? null,
          sourceType: r.sourceType,
          categoryId: r.categoryId ?? null,
          allocationType: r.allocationType,
          fixedAmount: r.allocationType === "FIXED" ? r.fixedAmount : null,
          percent: r.allocationType === "PERCENT" ? r.percent : null,
        }));

        if (mapped.length === 0) {
          setNotice("No rules to copy.");
          return;
        }

        await distributionsClient.upsertMany({ budgetId: budget.budgetId, rules: mapped } as any);
        await refreshRules(budget.budgetId);
        setNotice(`Copied ${mapped.length} rule(s) from ${sourceMonthKey}.`);
      } catch (e) {
        setError(errToMessage(e));
      } finally {
        setCopyBusy(false);
      }
    },
    [budget, budgets, refreshRules]
  );

  return {
    budgetMonthKey,
    setBudgetMonthKey,
    budgets: budgetsSorted,
    budget,

    categories,
    funds,
    assets,
    cashAssetsByFund,

    rules,
    loading,
    metaLoading,
    error,
    metaError,
    notice,
    copyBusy,

    refreshRules,
    upsertRule,
    deleteRule,
    copyFromMonth,
  };
}
