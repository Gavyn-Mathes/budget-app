// src/renderer/src/components/features/accounts/types/hooks/useAccountTypesPage.ts
import { useEffect, useMemo, useState } from "react";
import type { AccountType, AccountTypeUpsertInput } from "../../../../../../../shared/types/account_type";
import { accountTypesClient } from "@/api/account_types";
import { makeDraftAccountType, normalizeAccountTypeUpsert, upsertInputFromAccountType } from "../utils/accountTypes.helpers";

export function useAccountTypesPage() {
  const [rows, setRows] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editor, setEditor] = useState<AccountTypeUpsertInput | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AccountType | null>(null);

  const count = useMemo(() => rows.length, [rows]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const list = await accountTypesClient.list({});
      setRows(list);
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

  function openCreate() {
    setEditor(makeDraftAccountType());
    setEditorOpen(true);
  }

  function openEdit(row: AccountType) {
    setEditor(upsertInputFromAccountType(row));
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditor(null);
  }

  function patchEditor(patch: Partial<AccountTypeUpsertInput>) {
    setEditor((prev: AccountTypeUpsertInput | null) => (prev ? ({ ...prev, ...patch } as any) : prev));
  }

  async function saveEditor() {
    if (!editor) return;

    const normalized = normalizeAccountTypeUpsert(editor);
    if (!(normalized as any).accountType?.trim()) {
      setError("Account type name is required.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await accountTypesClient.upsert({ accountType: normalized } as any);
      closeEditor();
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  function requestDelete(row: AccountType) {
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
      await accountTypesClient.delete({ accountTypeId: (deleteTarget as any).accountTypeId } as any);
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
