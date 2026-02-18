// src/renderer/src/components/features/budgets/categories/hooks/useCategoriesPage.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Category, CategoryUpsertInput } from "../../../../../../../shared/types/category";
import { categoriesClient } from "../../../../../api/categories";

type ListReq = Parameters<typeof categoriesClient.list>[0];
type UpsertReq = Parameters<typeof categoriesClient.upsert>[0];
type DeleteReq = Parameters<typeof categoriesClient.delete>[0];

function makeListReq(): ListReq {
  return ({} as unknown) as ListReq;
}
function makeUpsertReq(category: CategoryUpsertInput): UpsertReq {
  return ({ category } as unknown) as UpsertReq;
}
function makeDeleteReq(categoryId: string): DeleteReq {
  return ({ categoryId } as unknown) as DeleteReq;
}

function errToMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

export function useCategoriesPage() {
  const [rows, setRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await categoriesClient.list(makeListReq());
      setRows(res ?? []);
    } catch (e) {
      setRows([]);
      setError(errToMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const rowsAlpha = useMemo(() => {
    return [...rows].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  }, [rows]);

  const upsert = useCallback(
    async (category: CategoryUpsertInput) => {
      setLoading(true);
      setError(null);
      try {
        await categoriesClient.upsert(makeUpsertReq(category));
        await refresh();
      } catch (e) {
        setError(errToMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  const remove = useCallback(
    async (categoryId: string) => {
      setLoading(true);
      setError(null);
      try {
        await categoriesClient.delete(makeDeleteReq(categoryId));
        await refresh();
      } catch (e) {
        setError(errToMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  return { rows: rowsAlpha, loading, error, refresh, upsert, remove };
}
