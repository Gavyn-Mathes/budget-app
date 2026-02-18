// src/renderer/src/components/features/accounts/liabilities/hooks/useAccountLiabilitiesPage.ts
import { useEffect, useMemo, useState } from "react";
import { accountsClient } from "@/api/accounts";
import { liabilitiesClient } from "@/api/liabilities";

import type { Account } from "../../../../../../../shared/types/account";
import type { LiabilityWithBalance } from "../../../../../../../shared/types/liability";

type TransferDraft = {
  liabilityId: string;
  toAccountId: string;
  eventDate: string;
  memo: string;
};

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useAccountLiabilitiesPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [liabilities, setLiabilities] = useState<LiabilityWithBalance[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [accountId, setAccountId] = useState<string>("__ALL__");

  const [transferDraft, setTransferDraft] = useState<TransferDraft>({
    liabilityId: "",
    toAccountId: "",
    eventDate: todayIsoDate(),
    memo: "",
  });
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [accs, ls] = await Promise.all([
        accountsClient.list({}),
        liabilitiesClient.listWithBalances({}),
      ]);
      setAccounts(accs);
      setLiabilities(ls ?? []);
    } catch (e: unknown) {
      setAccounts([]);
      setLiabilities([]);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accountNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of accounts as any[]) {
      m.set((a as any).accountId, (a as any).accountName ?? (a as any).name ?? "Account");
    }
    return m;
  }, [accounts]);

  const accountCurrencyById = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of accounts as any[]) {
      m.set((a as any).accountId, (a as any).defaultCurrencyCode ?? "USD");
    }
    return m;
  }, [accounts]);

  const filteredLiabilities = useMemo(() => {
    if (accountId === "__ALL__") return liabilities;
    return liabilities.filter((l: any) => (l as any).accountId === accountId);
  }, [liabilities, accountId]);

  const filteredBalanceMinor = useMemo(
    () => filteredLiabilities.reduce((sum, l: any) => sum + ((l as any).balanceMinor ?? 0), 0),
    [filteredLiabilities]
  );

  const selectedAccountCurrencyCode = useMemo(() => {
    if (accountId === "__ALL__") return "USD";
    return accountCurrencyById.get(accountId) ?? "USD";
  }, [accountCurrencyById, accountId]);

  const grouped = useMemo(() => {
    const groups = new Map<string, LiabilityWithBalance[]>();

    for (const l of liabilities as any[]) {
      const k = (l as any).accountId ?? "__NO_ACCOUNT__";
      const list = groups.get(k) ?? [];
      list.push(l);
      groups.set(k, list);
    }

    const entries = Array.from(groups.entries()).map(([id, list]) => ({
      accountId: id,
      accountName: id === "__NO_ACCOUNT__" ? "No Account" : accountNameById.get(id) ?? id,
      liabilities: list,
      balanceMinor: list.reduce((sum, l: any) => sum + ((l as any).balanceMinor ?? 0), 0),
      currencyCode: accountCurrencyById.get(id) ?? "USD",
    }));

    entries.sort((x, y) => x.accountName.localeCompare(y.accountName));
    return entries;
  }, [liabilities, accountNameById, accountCurrencyById]);

  const transferLiability = useMemo(() => {
    if (!transferDraft.liabilityId) return null;
    return liabilities.find((l: any) => (l as any).liabilityId === transferDraft.liabilityId) ?? null;
  }, [liabilities, transferDraft.liabilityId]);

  async function submitTransfer() {
    setTransferError(null);
    setTransferSuccess(null);

    const liability = transferLiability;
    if (!liability) {
      setTransferError("Select a liability to move.");
      return;
    }

    if (!transferDraft.toAccountId) {
      setTransferError("Select a destination account.");
      return;
    }

    if (liability.accountId === transferDraft.toAccountId) {
      setTransferError("Destination account must differ from the current account.");
      return;
    }

    if (!transferDraft.eventDate.trim()) {
      setTransferError("Provide an event date (YYYY-MM-DD).");
      return;
    }

    setTransferLoading(true);
    try {
      await liabilitiesClient.moveAccount({
        data: {
          liabilityId: transferDraft.liabilityId,
          toAccountId: transferDraft.toAccountId,
          eventDate: transferDraft.eventDate.trim(),
          memo: transferDraft.memo.trim() ? transferDraft.memo.trim() : null,
        },
      });

      setTransferSuccess("Liability moved.");
      setTransferDraft((d) => ({
        ...d,
        toAccountId: "",
        memo: "",
      }));
      await refresh();
    } catch (e: unknown) {
      setTransferError(e instanceof Error ? e.message : String(e));
    } finally {
      setTransferLoading(false);
    }
  }

  return {
    accounts,
    liabilities,
    loading,
    error,
    refresh,

    accountId,
    setAccountId,

    filteredLiabilities,
    filteredBalanceMinor,
    selectedAccountCurrencyCode,
    grouped,
    accountNameById,
    accountCurrencyById,

    transferDraft,
    setTransferDraft,
    transferLiability,
    transferLoading,
    transferError,
    transferSuccess,
    submitTransfer,
  };
}
