// src/renderer/src/components/features/funds/assets/hooks/useFundsAssetsPage.ts
import { useEffect, useMemo, useState } from "react";
import { assetsClient } from "../../../../../api/assets";
import { fundsClient } from "../../../../../api/funds";
import { accountsClient } from "../../../../../api/accounts";
import { accountTypesClient } from "../../../../../api/account_types";
import type { AssetUpsertInput, AssetWithBalance } from "../../../../../../../shared/types/asset";

type AnyAsset = any;
type AnyFund = any;

function byName(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

export function useFundsAssetsPage() {
  const [assets, setAssets] = useState<AssetWithBalance[]>([]);
  const [funds, setFunds] = useState<AnyFund[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountTypes, setAccountTypes] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editor, setEditor] = useState<any | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AnyAsset | null>(null);

  const [showOpen, setShowOpen] = useState(false);
  const [showTarget, setShowTarget] = useState<AnyAsset | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [a, f, accts, acctTypes] = await Promise.all([
        assetsClient.listWithBalances({}),
        fundsClient.list({} as any),
        accountsClient.list({} as any),
        accountTypesClient.list({} as any),
      ]);
      setAssets(a ?? []);
      setFunds(f ?? []);
      setAccounts(accts ?? []);
      setAccountTypes(acctTypes ?? []);
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setAssets([]);
      setFunds([]);
      setAccounts([]);
      setAccountTypes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fundNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const f of funds) m.set(String((f as any).fundId), String((f as any).name ?? ""));
    return m;
  }, [funds]);

  const accountNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of accounts) m.set(String((a as any).accountId), String((a as any).name ?? ""));
    return m;
  }, [accounts]);

  const accountTypeNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const t of accountTypes) {
      m.set(String((t as any).accountTypeId), String((t as any).accountType ?? ""));
    }
    return m;
  }, [accountTypes]);

  const accountCurrencyById = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of accounts) {
      m.set(
        String((a as any).accountId),
        String((a as any).defaultCurrencyCode ?? "USD")
      );
    }
    return m;
  }, [accounts]);

  const fundsAlpha = useMemo(() => {
    return [...funds].sort((a, b) => byName(String((a as any).name ?? ""), String((b as any).name ?? "")));
  }, [funds]);

  const assetsSorted = useMemo(() => {
    return [...assets].sort((a, b) => {
      const fa = fundNameById.get(String((a as any).fundId ?? "")) ?? "";
      const fb = fundNameById.get(String((b as any).fundId ?? "")) ?? "";
      if (fa !== fb) return byName(fa, fb);

      const ta = String((a as any).assetType ?? "");
      const tb = String((b as any).assetType ?? "");
      if (ta !== tb) return byName(ta, tb);

      const na = String((a as any).name ?? "");
      const nb = String((b as any).name ?? "");
      if (na !== nb) return byName(na, nb);

      return String((a as any).assetId ?? "").localeCompare(String((b as any).assetId ?? ""));
    });
  }, [assets, fundNameById]);

  const grouped = useMemo(() => {
    const groups = new Map<string, AnyAsset[]>();
    for (const a of assetsSorted) {
      const fid = String((a as any).fundId ?? "");
      const fname = fundNameById.get(fid) ?? "(No fund)";
      if (!groups.has(fname)) groups.set(fname, []);
      groups.get(fname)!.push(a);
    }
    return [...groups.entries()].sort((a, b) => byName(a[0], b[0]));
  }, [assetsSorted, fundNameById]);

  const totalMoneyMinor = useMemo(
    () => assets.reduce((sum, a) => sum + (a.moneyBalanceMinor ?? 0), 0),
    [assets]
  );

  function openCreate() {
    const firstFundId = fundsAlpha[0] ? String((fundsAlpha[0] as any).fundId) : "";
    const firstAccountId = accounts[0] ? String((accounts[0] as any).accountId) : "";
    const defaultCurrencyCode =
      accounts[0] && String((accounts[0] as any).defaultCurrencyCode ?? "").trim()
        ? String((accounts[0] as any).defaultCurrencyCode).trim().toUpperCase()
        : "USD";
    setEditor({
      assetId: undefined,
      assetType: "CASH",
      fundId: firstFundId,
      accountId: firstAccountId,
      name: "",
      description: null,
      currencyCode: defaultCurrencyCode,
    });
    setEditorOpen(true);
  }

  function openEdit(asset: AnyAsset) {
    const base = {
      assetId: (asset as any).assetId,
      fundId: (asset as any).fundId,
      accountId: (asset as any).accountId,
      name: (asset as any).name ?? "",
      description: (asset as any).description ?? null,
      assetType: (asset as any).assetType,
    } as any;

    if ((asset as any).assetType === "CASH") {
      setEditor({
        ...base,
        currencyCode: String((asset as any).currencyCode ?? "USD").toUpperCase(),
      });
      setEditorOpen(true);
      return;
    }

    if ((asset as any).assetType === "STOCK") {
      setEditor({
        ...base,
        ticker: String((asset as any).ticker ?? "").toUpperCase(),
      });
      setEditorOpen(true);
      return;
    }

    setEditor({
      ...base,
      counterparty: (asset as any).counterparty ?? null,
      interestRate:
        typeof (asset as any).interestRate === "number" ? (asset as any).interestRate : 0,
      startDate: (asset as any).startDate ?? null,
      maturityDate: (asset as any).maturityDate ?? null,
    });
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditor(null);
  }

  function patchEditor(patch: any) {
    setEditor((prev: any) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch } as any;
      const currentType = String(next.assetType ?? "").toUpperCase();

      if (currentType === "CASH") {
        if (!next.currencyCode) {
          const acct = accounts.find((a: any) => String(a.accountId) === String(next.accountId));
          next.currencyCode = String(acct?.defaultCurrencyCode ?? "USD").toUpperCase();
        }
      } else if (currentType === "STOCK") {
        if (next.ticker == null) next.ticker = "";
      } else if (currentType === "NOTE") {
        if (next.counterparty === undefined) next.counterparty = null;
        if (next.interestRate === undefined) next.interestRate = 0;
        if (next.startDate === undefined) next.startDate = null;
        if (next.maturityDate === undefined) next.maturityDate = null;
      }

      return next;
    });
  }

  async function saveEditor() {
    if (!editor) return;

    const name = String(editor.name ?? "").trim();
    const assetType = String(editor.assetType ?? "").trim().toUpperCase();
    const fundId = String(editor.fundId ?? "").trim();
    const accountId = String(editor.accountId ?? "").trim();
    if (!name) return setError("Asset name is required.");
    if (!fundId) return setError("Fund is required.");
    if (!accountId) return setError("Account location is required.");
    if (!assetType) return setError("Asset type is required.");

    let payload: AssetUpsertInput | null = null;

    if (assetType === "CASH") {
      const currencyCode = String(editor.currencyCode ?? "")
        .trim()
        .toUpperCase();
      if (!/^[A-Z]{3}$/.test(currencyCode)) {
        return setError("Currency code must be 3 letters (e.g. USD).");
      }
      payload = {
        assetId: editor.assetId,
        fundId,
        accountId,
        name,
        description: editor.description ?? null,
        assetType: "CASH",
        currencyCode,
      };
    } else if (assetType === "STOCK") {
      const ticker = String(editor.ticker ?? "")
        .trim()
        .toUpperCase();
      if (!ticker) return setError("Ticker is required for stock assets.");
      payload = {
        assetId: editor.assetId,
        fundId,
        accountId,
        name,
        description: editor.description ?? null,
        assetType: "STOCK",
        ticker,
      };
    } else if (assetType === "NOTE") {
      const interestRate = Number(editor.interestRate);
      if (!Number.isFinite(interestRate) || interestRate < 0 || interestRate > 1) {
        return setError("Interest rate must be a decimal between 0 and 1.");
      }
      const counterpartyRaw = String(editor.counterparty ?? "").trim();
      const startDateRaw = String(editor.startDate ?? "").trim();
      const maturityDateRaw = String(editor.maturityDate ?? "").trim();
      payload = {
        assetId: editor.assetId,
        fundId,
        accountId,
        name,
        description: editor.description ?? null,
        assetType: "NOTE",
        counterparty: counterpartyRaw ? counterpartyRaw : null,
        interestRate,
        startDate: startDateRaw ? startDateRaw : null,
        maturityDate: maturityDateRaw ? maturityDateRaw : null,
      };
    } else {
      return setError(`Unsupported asset type: ${assetType}`);
    }

    setLoading(true);
    setError(null);
    try {
      await assetsClient.upsert({ asset: payload } as any);
      closeEditor();
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  function requestDelete(asset: AnyAsset) {
    setDeleteTarget(asset);
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
      await assetsClient.delete({ assetId: (deleteTarget as any).assetId } as any);
      cancelDelete();
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  function openShow(asset: AnyAsset) {
    setShowTarget(asset);
    setShowOpen(true);
  }

  function closeShow() {
    setShowOpen(false);
    setShowTarget(null);
  }

  return {
    loading,
    error,
    refresh,

    funds: fundsAlpha,
    fundNameById,
    accountNameById,
    accountTypeNameById,
    accountCurrencyById,
    totalMoneyMinor,

    assets: assetsSorted,
    grouped,

    accounts,

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

    showOpen,
    showTarget,
    openShow,
    closeShow,
  };
}
