// src/renderer/src/components/features/budgets/incomes/hooks/useIncomesPage.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Asset } from "../../../../../../../shared/types/asset";
import type { Fund } from "../../../../../../../shared/types/fund";
import type {
  Income,
  IncomeMonth,
  IncomeMonthUpsertInput,
  IncomeUpsertInput,
} from "../../../../../../../shared/types/income";
import { assetsClient } from "../../../../../api/assets";
import { fundsClient } from "../../../../../api/funds";
import { incomesClient } from "../../../../../api/incomes";
import { currentMonthKey, isValidMonthKey, monthKeyFromIsoDate } from "../../../../utils/month";

type ListByMonthReq = Parameters<typeof incomesClient.listByMonth>[0];
type GetMonthReq = Parameters<typeof incomesClient.getMonth>[0];
type UpsertMonthReq = Parameters<typeof incomesClient.upsertMonth>[0];
type UpsertReq = Parameters<typeof incomesClient.upsert>[0];
type DeleteReq = Parameters<typeof incomesClient.delete>[0];
type FundsListReq = Parameters<typeof fundsClient.list>[0];
type AssetsListReq = Parameters<typeof assetsClient.list>[0];

function makeListReq(incomeMonthKey: string): ListByMonthReq {
  return ({ incomeMonthKey } as unknown) as ListByMonthReq;
}

function makeGetMonthReq(incomeMonthKey: string): GetMonthReq {
  return ({ incomeMonthKey } as unknown) as GetMonthReq;
}

function makeUpsertMonthReq(month: IncomeMonthUpsertInput): UpsertMonthReq {
  return ({ month } as unknown) as UpsertMonthReq;
}

function makeUpsertReq(income: IncomeUpsertInput, monthKey: string): UpsertReq {
  return ({ income, monthKey } as unknown) as UpsertReq;
}

function makeDeleteReq(incomeId: string): DeleteReq {
  return ({ incomeId } as unknown) as DeleteReq;
}

function makeFundsListReq(): FundsListReq {
  return ({} as unknown) as FundsListReq;
}

function makeAssetsListReq(): AssetsListReq {
  return ({} as unknown) as AssetsListReq;
}

function errToMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

export function useIncomesPage() {
  const [incomeMonthKey, setIncomeMonthKey] = useState<string>(currentMonthKey());

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [incomeMonth, setIncomeMonth] = useState<IncomeMonth | null>(null);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);

  const total = useMemo(
    () => incomes.reduce((sum, x) => sum + Number(x.amount ?? 0), 0),
    [incomes]
  );

  const fundsAlpha = useMemo(() => {
    return [...funds].sort((a, b) =>
      String((a as any).name ?? "").localeCompare(String((b as any).name ?? ""), undefined, {
        sensitivity: "base",
      })
    );
  }, [funds]);

  const cashAssetsByFund = useMemo(() => {
    const map = new Map<string, Asset[]>();
    for (const asset of assets) {
      if (String((asset as any).assetType ?? "").toUpperCase() !== "CASH") continue;
      const fundId = String((asset as any).fundId ?? "");
      if (!map.has(fundId)) map.set(fundId, []);
      map.get(fundId)!.push(asset);
    }
    for (const [k, list] of map.entries()) {
      list.sort((a, b) =>
        String((a as any).name ?? "").localeCompare(String((b as any).name ?? ""), undefined, {
          sensitivity: "base",
        })
      );
      map.set(k, list);
    }
    return map;
  }, [assets]);

  const refreshMeta = useCallback(async () => {
    setMetaLoading(true);
    setMetaError(null);
    try {
      const [fundRows, assetRows] = await Promise.all([
        fundsClient.list(makeFundsListReq()),
        assetsClient.list(makeAssetsListReq()),
      ]);
      setFunds(fundRows ?? []);
      setAssets(assetRows ?? []);
    } catch (e) {
      setFunds([]);
      setAssets([]);
      setMetaError(errToMessage(e));
    } finally {
      setMetaLoading(false);
    }
  }, []);

  const refresh = useCallback(
    async (targetMonthKey?: string) => {
      const mk = String(targetMonthKey ?? incomeMonthKey).trim();

      if (!isValidMonthKey(mk)) {
        setIncomes([]);
        setIncomeMonth(null);
        setError("Month must be formatted as YYYY-MM (e.g., 2026-02).");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [incomesRes, monthRes] = await Promise.all([
          incomesClient.listByMonth(makeListReq(mk)),
          incomesClient.getMonth(makeGetMonthReq(mk)),
        ]);
        setIncomes(incomesRes ?? []);
        setIncomeMonth(monthRes ?? null);
      } catch (e) {
        setIncomes([]);
        setIncomeMonth(null);
        setError(errToMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [incomeMonthKey]
  );

  useEffect(() => {
    refresh(incomeMonthKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomeMonthKey]);

  useEffect(() => {
    refreshMeta();
  }, [refreshMeta]);

  const upsertMonth = useCallback(
    async (input: IncomeMonthUpsertInput) => {
      const mk = String(input.incomeMonthKey ?? "").trim();
      if (!isValidMonthKey(mk)) {
        setError("Income month must be YYYY-MM (e.g., 2026-02).");
        return null;
      }

      setLoading(true);
      setError(null);
      try {
        const month = await incomesClient.upsertMonth(makeUpsertMonthReq(input));
        setIncomeMonth(month);
        setIncomeMonthKey(mk);
        return month;
      } catch (e) {
        setError(errToMessage(e));
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const setPostingTarget = useCallback(
    async (patch: { incomeFundId?: string | null; incomeAssetId?: string | null }) => {
      const baseMonth = incomeMonth ?? {
        incomeMonthKey,
        incomeFundId: null,
        incomeAssetId: null,
      };

      await upsertMonth({
        incomeMonthKey: baseMonth.incomeMonthKey,
        incomeFundId:
          patch.incomeFundId !== undefined ? patch.incomeFundId : baseMonth.incomeFundId,
        incomeAssetId:
          patch.incomeAssetId !== undefined ? patch.incomeAssetId : baseMonth.incomeAssetId,
      });
    },
    [incomeMonth, incomeMonthKey, upsertMonth]
  );

  const upsert = useCallback(
    async (income: IncomeUpsertInput) => {
      const mk = String(income.incomeMonthKey ?? "").trim();
      if (!isValidMonthKey(mk)) {
        setError("Income month must be YYYY-MM (e.g., 2026-02).");
        return;
      }
      if (monthKeyFromIsoDate(String(income.date ?? "")) !== mk) {
        setError(`Income date must be within selected month ${mk}.`);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        await incomesClient.upsert(makeUpsertReq(income, mk));
        // Follow the month that was saved to
        setIncomeMonthKey(mk);
        await refresh(mk);
      } catch (e) {
        setError(errToMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  const remove = useCallback(
    async (incomeId: string) => {
      const id = String(incomeId ?? "").trim();
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        await incomesClient.delete(makeDeleteReq(id));
        await refresh(incomeMonthKey);
      } catch (e) {
        setError(errToMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [incomeMonthKey, refresh]
  );

  return {
    incomeMonthKey,
    setIncomeMonthKey,

    incomes,
    incomeMonth,
    funds: fundsAlpha,
    cashAssetsByFund,
    total,

    loading,
    metaLoading,
    error,
    metaError,

    refresh,
    refreshMeta,
    upsertMonth,
    setPostingTarget,
    upsert,
    remove,
  };
}
