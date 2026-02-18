// src/renderer/src/components/features/accounts/assets/hooks/useAccountAssetsPage.ts
import { useEffect, useMemo, useState } from "react";
import { accountsClient } from "@/api/accounts";
import { assetsClient } from "@/api/assets";
import { eventTypesClient } from "@/api/event_types";
import { fundEventsClient } from "@/api/fund_events";
import { todayIsoDate } from "@/components/utils/month";
import type { Account } from "../../../../../../../shared/types/account";
import type { AssetWithBalance } from "../../../../../../../shared/types/asset";
import { isCashAsset, isNoteAsset, isStockAsset } from "../../../../../../../shared/types/asset";
import type { EventType } from "../../../../../../../shared/types/event_type";

type TransferDraft = {
  fromAssetId: string;
  toAccountId: string;
  toAssetId: string;
  amount: string;
  eventTypeId: string;
  eventDate: string;
  memo: string;
  notes: string;
  unitPrice: string;
  fee: string;
};

export function useAccountAssetsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [assets, setAssets] = useState<AssetWithBalance[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [accountId, setAccountId] = useState<string>("__ALL__");

  const [transferDraft, setTransferDraft] = useState<TransferDraft>({
    fromAssetId: "",
    toAccountId: "",
    toAssetId: "",
    amount: "",
    eventTypeId: "",
    eventDate: todayIsoDate(),
    memo: "",
    notes: "",
    unitPrice: "",
    fee: "",
  });
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [accs, as, types] = await Promise.all([
        accountsClient.list({}),
        assetsClient.listWithBalances({}),
        eventTypesClient.list({}),
      ]);
      setAccounts(accs);
      setAssets(as);
      setEventTypes(types);
    } catch (e: unknown) {
      setAccounts([]);
      setAssets([]);
      setEventTypes([]);
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
    for (const a of accounts) {
      m.set(a.accountId, a.name);
    }
    return m;
  }, [accounts]);

  const accountCurrencyById = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of accounts) {
      m.set(a.accountId, a.defaultCurrencyCode);
    }
    return m;
  }, [accounts]);

  const filteredAssets = useMemo(() => {
    if (accountId === "__ALL__") return assets;
    return assets.filter((a) => a.accountId === accountId);
  }, [assets, accountId]);

  const filteredMoneyBalanceMinor = useMemo(
    () => filteredAssets.reduce((sum, a) => sum + (a.moneyBalanceMinor ?? 0), 0),
    [filteredAssets]
  );

  const selectedAccountCurrencyCode = useMemo(() => {
    if (accountId === "__ALL__") return "USD";
    return accountCurrencyById.get(accountId) ?? "USD";
  }, [accountCurrencyById, accountId]);

  useEffect(() => {
    if (!eventTypes.length) return;
    if (transferDraft.eventTypeId) return;
    setTransferDraft((d) => ({ ...d, eventTypeId: eventTypes[0].eventTypeId }));
  }, [eventTypes, transferDraft.eventTypeId]);

  const grouped = useMemo(() => {
    // Group assets by accountId
    const groups = new Map<string, AssetWithBalance[]>();

    for (const a of assets) {
      const k = a.accountId;
      const list = groups.get(k) ?? [];
      list.push(a);
      groups.set(k, list);
    }

    // Sort groups by account name
    const entries = Array.from(groups.entries()).map(([id, list]) => ({
      accountId: id,
      accountName: id === "__NO_ACCOUNT__" ? "No Account" : accountNameById.get(id) ?? id,
      assets: list,
      moneyBalanceMinor: list.reduce((sum, a) => sum + (a.moneyBalanceMinor ?? 0), 0),
      currencyCode: accountCurrencyById.get(id) ?? "USD",
    }));

    entries.sort((x, y) => x.accountName.localeCompare(y.accountName));
    return entries;
  }, [assets, accountNameById, accountCurrencyById]);

  const transferFromAsset = useMemo(() => {
    if (!transferDraft.fromAssetId) return null;
    return assets.find((a) => a.assetId === transferDraft.fromAssetId) ?? null;
  }, [assets, transferDraft.fromAssetId]);

  const transferDestinationAssets = useMemo(() => {
    if (!transferFromAsset || !transferDraft.toAccountId) return [];
    return assets.filter((candidate) => {
      if (candidate.accountId !== transferDraft.toAccountId) return false;
      if (candidate.fundId !== transferFromAsset.fundId) return false;
      if (candidate.assetId === transferFromAsset.assetId) return false;

      const a = transferFromAsset;
      const b = candidate;
      if (isCashAsset(a) && isCashAsset(b)) {
        return a.currencyCode === b.currencyCode;
      }
      if (isStockAsset(a) && isStockAsset(b)) {
        return a.ticker === b.ticker;
      }
      if (isNoteAsset(a) && isNoteAsset(b)) {
        return (
          a.counterparty === b.counterparty &&
          a.interestRate === b.interestRate &&
          a.startDate === b.startDate &&
          a.maturityDate === b.maturityDate
        );
      }
      return false;
    });
  }, [assets, transferDraft.toAccountId, transferFromAsset]);

  async function submitTransfer() {
    setTransferError(null);
    setTransferSuccess(null);

    const fromAsset = transferFromAsset;
    if (!fromAsset) {
      setTransferError("Select a source asset.");
      return;
    }

    if (!transferDraft.toAccountId) {
      setTransferError("Select a destination account.");
      return;
    }

    if (fromAsset.accountId === transferDraft.toAccountId) {
      setTransferError("Destination account must differ from the source account.");
      return;
    }

    if (!transferDraft.eventTypeId) {
      setTransferError("Select an event type.");
      return;
    }

    if (!transferDraft.eventDate.trim()) {
      setTransferError("Provide an event date (YYYY-MM-DD).");
      return;
    }

    const amount = Number(transferDraft.amount);
    if (!Number.isInteger(amount) || amount <= 0) {
      setTransferError("Amount must be a positive integer (minor units).");
      return;
    }

    if (transferDestinationAssets.length > 1 && !transferDraft.toAssetId.trim()) {
      setTransferError("Multiple matching destination assets found. Select a destination asset.");
      return;
    }

    let fee: number | null = null;
    if (transferDraft.fee.trim()) {
      const feeParsed = Number(transferDraft.fee);
      if (!Number.isInteger(feeParsed) || feeParsed < 0) {
        setTransferError("Fee must be a non-negative integer (minor units).");
        return;
      }
      fee = feeParsed;
    }

    setTransferLoading(true);
    try {
      await fundEventsClient.moveAssetToAccount({
        data: {
          event: {
            eventTypeId: transferDraft.eventTypeId,
            eventDate: transferDraft.eventDate.trim(),
            memo: transferDraft.memo.trim() ? transferDraft.memo.trim() : null,
          },
          fromAssetId: transferDraft.fromAssetId,
          toAccountId: transferDraft.toAccountId,
          toAssetId: transferDraft.toAssetId.trim() ? transferDraft.toAssetId.trim() : undefined,
          quantityDeltaMinor: fromAsset.assetType === "STOCK" ? amount : null,
          moneyDelta: fromAsset.assetType === "STOCK" ? null : amount,
          unitPrice: transferDraft.unitPrice.trim() ? transferDraft.unitPrice.trim() : null,
          fee,
          notes: transferDraft.notes.trim() ? transferDraft.notes.trim() : null,
        },
      });

      setTransferSuccess("Transfer recorded.");
      setTransferDraft((d) => ({
        ...d,
        amount: "",
        fee: "",
        unitPrice: "",
        notes: "",
        toAssetId: "",
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
    assets,
    eventTypes,

    loading,
    error,
    refresh,

    accountId,
    setAccountId,

    filteredAssets,
    filteredMoneyBalanceMinor,
    selectedAccountCurrencyCode,
    grouped,
    accountNameById,
    accountCurrencyById,

    transferDraft,
    setTransferDraft,
    transferFromAsset,
    transferDestinationAssets,
    transferLoading,
    transferError,
    transferSuccess,
    submitTransfer,
  };
}
