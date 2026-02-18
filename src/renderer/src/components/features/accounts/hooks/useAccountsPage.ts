// src/renderer/src/components/features/accounts/hooks/useAccountsPage.ts
import { useEffect, useMemo, useState } from "react";
import type {
  AccountUpsertInput,
  AccountWithTotals,
} from "../../../../../../shared/types/account";
import type { AccountType } from "../../../../../../shared/types/account_type";
import { accountsClient } from "@/api/accounts";
import { accountTypesClient } from "@/api/account_types";
import { makeDraftAccount, upsertInputFromAccount, normalizeAccountUpsert } from "../utils/accounts.helpers";

export function useAccountsPage() {
  const [rows, setRows] = useState<AccountWithTotals[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editor, setEditor] = useState<AccountUpsertInput | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AccountWithTotals | null>(null);

  const count = useMemo(() => rows.length, [rows]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const accountsWithTotals = await accountsClient.listWithTotals({});
      setRows(accountsWithTotals);
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

  useEffect(() => {
    async function refreshAccountTypes() {
      setMetaError(null);
      try {
        const list = await accountTypesClient.list({});
        setAccountTypes(list ?? []);
      } catch (e: unknown) {
        setAccountTypes([]);
        setMetaError(e instanceof Error ? e.message : String(e));
      }
    }

    refreshAccountTypes();
  }, []);

  function openCreate() {
    const draft = makeDraftAccount();
    if (accountTypes.length > 0) {
      (draft as any).accountTypeId = accountTypes[0].accountTypeId;
    }
    setEditor(draft);
    setEditorOpen(true);
  }

  function openEdit(row: AccountWithTotals) {
    setEditor(upsertInputFromAccount(row));
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditor(null);
  }

  function patchEditor(patch: Partial<AccountUpsertInput>) {
    setEditor((prev) => (prev ? ({ ...prev, ...patch } as any) : prev));
  }

  async function saveEditor() {
    if (!editor) return;

    const normalized = normalizeAccountUpsert(editor);

    if (!(normalized as any).name?.trim()) {
      setError("Account name is required.");
      return;
    }
    if (!(normalized as any).accountTypeId?.trim()) {
      setError("Account type is required.");
      return;
    }
    if (!(normalized as any).defaultCurrencyCode?.trim()) {
      setError("Default currency is required.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await accountsClient.upsert({ account: normalized } as any);
      closeEditor();
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  function requestDelete(row: AccountWithTotals) {
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
      await accountsClient.delete({ accountId: (deleteTarget as any).accountId } as any);
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
    accountTypes,
    count,
    loading,
    error,
    metaError,

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
