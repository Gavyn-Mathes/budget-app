// src/renderer/src/components/features/budgets/hooks/useBudgetsMonthsPage.ts
import { useEffect, useMemo, useState } from "react";
import { budgetsClient } from "../../../../api/budgets";
import { nextMonthKey } from "../../../../../../shared/domain/month";
import type { Budget } from "../../../../../../shared/types/budget";

export function useBudgetsMonthsPage() {
  const [rows, setRows] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [copyingMonth, setCopyingMonth] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const list = await budgetsClient.list({});
      setRows(list ?? []);
    } catch (e: unknown) {
      setRows([]);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rowsSorted = useMemo(() => {
    return [...rows].sort((a, b) => a.budgetMonthKey.localeCompare(b.budgetMonthKey));
  }, [rows]);

  const monthSet = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) s.add(r.budgetMonthKey);
    return s;
  }, [rows]);

  function nextMonthFor(monthKey: string) {
    try {
      return nextMonthKey(monthKey as any);
    } catch {
      return "";
    }
  }

  async function copyToNextMonth(budgetMonthKey: string) {
    setError(null);
    setNotice(null);
    setCopyingMonth(budgetMonthKey);
    try {
      const res = await budgetsClient.copyToNextMonth({ budgetMonthKey });
      const created = (res as any)?.budget;
      const targetMonth = created?.budgetMonthKey ?? nextMonthFor(budgetMonthKey);
      setNotice(`Copied ${budgetMonthKey} -> ${targetMonth}`);
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCopyingMonth(null);
    }
  }

  return {
    rows: rowsSorted,
    monthSet,
    loading,
    error,
    notice,
    refresh,
    nextMonthFor,
    copyingMonth,
    copyToNextMonth,
  };
}
