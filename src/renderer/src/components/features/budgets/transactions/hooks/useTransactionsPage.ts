// renderer/src/components/features/budgets/transactions/hooks/useTransactionsPage.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Category } from "../../../../../../../shared/types/category";
import type { Transaction, TransactionId } from "../../../../../../../shared/types/transaction";
import { categoriesClient } from "../../../../../api/categories";
import { transactionsClient } from "../../../../../api/transactions";
import { currentMonthKey, isValidMonthKey, monthKeyFromIsoDate } from "../../../../utils/month";

type TxListReq = Parameters<typeof transactionsClient.listByMonth>[0];
type TxUpsertReq = Parameters<typeof transactionsClient.upsert>[0];
type TxDeleteReq = Parameters<typeof transactionsClient.delete>[0];
type CatListReq = Parameters<typeof categoriesClient.list>[0];

function makeTxListReq(monthKey: string): TxListReq {
  return ({ monthKey } as unknown) as TxListReq;
}
function makeTxUpsertReq(tx: any, monthKey: string): TxUpsertReq {
  return ({ transaction: tx, monthKey } as unknown) as TxUpsertReq;
}
function makeTxDeleteReq(transactionId: string): TxDeleteReq {
  return ({ transactionId } as unknown) as TxDeleteReq;
}
function makeCatListReq(): CatListReq {
  return ({} as unknown) as CatListReq;
}

function errToMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

export type TxEditorDraft = {
  transactionId?: TransactionId;
  categoryId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  notes: string | null;
};

export function useTransactionsPage() {
  const [monthKey, setMonthKey] = useState<string>(currentMonthKey());

  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoriesAlpha = useMemo(() => {
    return [...categories].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  }, [categories]);

  const spent = useMemo(() => {
    return transactions.reduce((sum, t) => sum + Number(t.amount ?? 0), 0);
  }, [transactions]);

  const refresh = useCallback(
    async (targetMonthKey?: string) => {
      const mk = String(targetMonthKey ?? monthKey).trim();
      if (!isValidMonthKey(mk)) {
        setError("Month must be formatted as YYYY-MM (e.g., 2026-02).");
        setTransactions([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [catsRes, txRes] = await Promise.all([
          categoriesClient.list(makeCatListReq()),
          transactionsClient.listByMonth(makeTxListReq(mk)),
        ]);

        setCategories(catsRes ?? []);
        setTransactions(txRes ?? []);
      } catch (e) {
        setError(errToMessage(e));
        setCategories([]);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    },
    [monthKey]
  );

  useEffect(() => {
    refresh(monthKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey]);

  const upsert = useCallback(
    async (draft: TxEditorDraft) => {
      const mk = monthKey.trim();
      if (!isValidMonthKey(mk)) return setError("Month must be YYYY-MM.");

      // Basic validation
      if (!draft.categoryId?.trim()) return setError("Category is required.");
      if (!draft.date?.trim()) return setError("Date is required.");
      if (monthKeyFromIsoDate(draft.date) !== mk) {
        return setError(`Transaction date must be within selected month ${mk}.`);
      }
      const amt = Number(draft.amount);
      if (!Number.isFinite(amt) || amt < 0) return setError("Amount must be >= 0.");

      setLoading(true);
      setError(null);
      try {
        await transactionsClient.upsert(
          makeTxUpsertReq({
            transactionId: draft.transactionId,
            categoryId: draft.categoryId,
            date: draft.date,
            amount: amt,
            notes: draft.notes ?? null,
          }, mk)
        );
        await refresh(mk);
      } catch (e) {
        setError(errToMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [monthKey, refresh]
  );

  const remove = useCallback(
    async (transactionId: string) => {
      setLoading(true);
      setError(null);
      try {
        await transactionsClient.delete(makeTxDeleteReq(transactionId));
        await refresh(monthKey);
      } catch (e) {
        setError(errToMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [monthKey, refresh]
  );

  const txSorted = useMemo(() => {
    return [...transactions].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      if (a.categoryId !== b.categoryId) return a.categoryId.localeCompare(b.categoryId);
      return a.transactionId.localeCompare(b.transactionId);
    });
  }, [transactions]);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) map.set(c.categoryId, c.name);
    return map;
  }, [categories]);

  return {
    monthKey,
    setMonthKey,

    categories: categoriesAlpha,
    transactions: txSorted,

    categoryNameById,

    spent,
    loading,
    error,

    refresh,
    upsert,
    remove,
  };
}
