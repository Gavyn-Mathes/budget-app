// src/renderer/src/components/features/funds/hooks/useFundsPage.ts
import { useEffect, useMemo, useState } from "react";
import type { Fund, FundUpsertInput } from "../../../../../../shared/types/fund";
import { fundsClient } from "@/api/funds";
import { makeDraftFund, normalizeFundUpsert, upsertInputFromFund } from "../utils/funds.helpers";

export function useFundsPage() {
  const [rows, setRows] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editor, setEditor] = useState<FundUpsertInput | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Fund | null>(null);

  const count = useMemo(() => rows.length, [rows]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const funds = await fundsClient.listWithTotals({});
      setRows(funds);
    } catch (e: unknown) {
      setRows([]);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditor(makeDraftFund());
    setEditorOpen(true);
  }

  function openEdit(row: Fund) {
    setEditor(upsertInputFromFund(row));
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditor(null);
  }

  function patchEditor(patch: Partial<FundUpsertInput>) {
    setEditor((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  async function saveEditor() {
    if (!editor) return;

    const normalized = normalizeFundUpsert(editor);

    // Assuming FundUpsertInput has a "name" field (string)
    if (!normalized.name.trim()) {
      setError("Fund name is required.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await fundsClient.upsert({ fund: normalized });
      closeEditor();
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  function requestDelete(row: Fund) {
    setDeleteTarget(row);
    setDeleteOpen(true);
  }

  function cancelDelete() {
    setDeleteOpen(false);
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setLoading(true);
    setError(null);
    try {
      await fundsClient.delete({ fundId: deleteTarget.fundId });
      cancelDelete();
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return {
    rows,
    count,
    loading,
    error,

    refresh,

    editorOpen,
    editor,
    openCreate,
    openEdit,
    closeEditor,
    patchEditor,
    saveEditor,

    deleteOpen,
    deleteTarget,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
}
