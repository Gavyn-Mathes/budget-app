// src/renderer/src/components/features/funds/liabilities/hooks/useFundsLiabilitiesPage.ts
import { useEffect, useMemo, useState } from "react";
import type {
  LiabilityUpsertInput,
  LiabilityWithBalance,
} from "../../../../../../../shared/types/liability";
import { liabilitiesClient } from "../../../../../api/liabilities";
import { fundsClient } from "../../../../../api/funds";
import { accountsClient } from "../../../../../api/accounts";
import { accountTypesClient } from "../../../../../api/account_types";
import { parseMoney, toMoneyInputString } from "../../../../utils/formatMoney";

type AnyFund = any;
type AnyAccount = any;

function byName(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

function moneyToInput(value: number | null | undefined): string {
  if (value == null) return "";
  try {
    return toMoneyInputString(value as any);
  } catch {
    return "";
  }
}

function parseOptionalMoney(input: string): { value: number | null; error?: string } {
  const raw = String(input ?? "").trim();
  if (!raw) return { value: null };
  try {
    const v = parseMoney(raw) as unknown as number;
    if (!Number.isInteger(v) || v < 0) {
      return { value: null, error: "Money value must be a non-negative amount." };
    }
    return { value: v };
  } catch {
    return { value: null, error: "Invalid money format." };
  }
}

function parseOptionalDay(input: string, label: string): { value: number | null; error?: string } {
  const raw = String(input ?? "").trim();
  if (!raw) return { value: null };
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 31) {
    return { value: null, error: `${label} must be an integer between 1 and 31.` };
  }
  return { value: n };
}

function parseOptionalApr(input: string): { value: number | null; error?: string } {
  const raw = String(input ?? "").trim();
  if (!raw) return { value: null };
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 1) {
    return { value: null, error: "APR must be between 0 and 1." };
  }
  return { value: n };
}

function parsePercentInput(input: string): { value: number | null; error?: string } {
  const raw = String(input ?? "").trim();
  if (!raw) return { value: null };
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 100) {
    return { value: null, error: "Percent must be between 0 and 100." };
  }
  return { value: n / 100 };
}

export function useFundsLiabilitiesPage() {
  const [liabilities, setLiabilities] = useState<LiabilityWithBalance[]>([]);
  const [funds, setFunds] = useState<AnyFund[]>([]);
  const [accounts, setAccounts] = useState<AnyAccount[]>([]);
  const [accountTypes, setAccountTypes] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editor, setEditor] = useState<any | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LiabilityWithBalance | null>(null);

  const [showOpen, setShowOpen] = useState(false);
  const [showTarget, setShowTarget] = useState<LiabilityWithBalance | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [ls, fs, accs, acctTypes] = await Promise.all([
        liabilitiesClient.listWithBalances({}),
        fundsClient.list({} as any),
        accountsClient.list({} as any),
        accountTypesClient.list({} as any),
      ]);
      setLiabilities(ls ?? []);
      setFunds(fs ?? []);
      setAccounts(accs ?? []);
      setAccountTypes(acctTypes ?? []);
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setLiabilities([]);
      setFunds([]);
      setAccounts([]);
      setAccountTypes([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fundsAlpha = useMemo(() => {
    return [...funds].sort((a, b) => byName(String((a as any).name ?? ""), String((b as any).name ?? "")));
  }, [funds]);

  const accountsAlpha = useMemo(() => {
    return [...accounts].sort((a, b) => byName(String((a as any).name ?? ""), String((b as any).name ?? "")));
  }, [accounts]);

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

  const liabilitiesSorted = useMemo(() => {
    return [...liabilities].sort((a, b) => {
      const fa = fundNameById.get(String(a.fundId ?? "")) ?? "";
      const fb = fundNameById.get(String(b.fundId ?? "")) ?? "";
      if (fa !== fb) return byName(fa, fb);

      const ta = String((a as any).liabilityType ?? "");
      const tb = String((b as any).liabilityType ?? "");
      if (ta !== tb) return byName(ta, tb);

      const na = String(a.name ?? "");
      const nb = String(b.name ?? "");
      if (na !== nb) return byName(na, nb);

      return String(a.liabilityId ?? "").localeCompare(String(b.liabilityId ?? ""));
    });
  }, [liabilities, fundNameById]);

  const grouped = useMemo(() => {
    const groups = new Map<string, LiabilityWithBalance[]>();
    for (const l of liabilitiesSorted) {
      const fid = String(l.fundId ?? "");
      const fname = fundNameById.get(fid) ?? "(No fund)";
      if (!groups.has(fname)) groups.set(fname, []);
      groups.get(fname)!.push(l);
    }
    return [...groups.entries()].sort((a, b) => byName(a[0], b[0]));
  }, [liabilitiesSorted, fundNameById]);

  const totalBalanceMinor = useMemo(
    () => liabilities.reduce((sum, l) => sum + (l.balanceMinor ?? 0), 0),
    [liabilities]
  );

  function openCreate() {
    const firstFundId = fundsAlpha[0] ? String((fundsAlpha[0] as any).fundId) : "";
    const firstAccountId = accountsAlpha[0] ? String((accountsAlpha[0] as any).accountId) : "";

    setEditor({
      liabilityId: undefined,
      liabilityType: "LOAN",
      fundId: firstFundId,
      accountId: firstAccountId,
      name: "",
      aprInput: "",
      openedDate: "",
      isActive: true,
      notes: "",

      originalPrincipalInput: "",
      maturityDate: "",
      paymentAmountInput: "",
      paymentFrequency: "",

      creditLimitInput: "",
      dueDay: "",
      minPaymentType: "",
      minPaymentValueInput: "",
      statementDay: "",
    });
    setEditorOpen(true);
  }

  function openEdit(liability: LiabilityWithBalance) {
    const base: any = {
      liabilityId: liability.liabilityId,
      liabilityType: liability.liabilityType,
      fundId: liability.fundId,
      accountId: liability.accountId,
      name: liability.name ?? "",
      aprInput: liability.apr == null ? "" : String(liability.apr),
      openedDate: liability.openedDate ?? "",
      isActive: Boolean(liability.isActive),
      notes: liability.notes ?? "",

      originalPrincipalInput: "",
      maturityDate: "",
      paymentAmountInput: "",
      paymentFrequency: "",

      creditLimitInput: "",
      dueDay: "",
      minPaymentType: "",
      minPaymentValueInput: "",
      statementDay: "",
    };

    if (liability.liabilityType === "LOAN") {
      base.originalPrincipalInput = moneyToInput(liability.originalPrincipal as any);
      base.maturityDate = liability.maturityDate ?? "";
      base.paymentAmountInput = moneyToInput(liability.paymentAmount as any);
      base.paymentFrequency = liability.paymentFrequency ?? "";
    } else {
      base.creditLimitInput = moneyToInput(liability.creditLimit as any);
      base.dueDay = liability.dueDay == null ? "" : String(liability.dueDay);
      base.minPaymentType = liability.minPaymentType ?? "";
      if (liability.minPaymentType === "FIXED") {
        base.minPaymentValueInput = moneyToInput(liability.minPaymentValue as any);
      } else if (liability.minPaymentType === "PERCENT") {
        const pct = (liability.minPaymentValue ?? 0) * 100;
        base.minPaymentValueInput = Number.isFinite(pct) ? String(pct) : "";
      }
      base.statementDay = liability.statementDay == null ? "" : String(liability.statementDay);
    }

    setEditor(base);
    setEditorOpen(true);
  }

  function closeEditor() {
    setEditorOpen(false);
    setEditor(null);
  }

  function patchEditor(patch: any) {
    setEditor((prev: any) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };

      if (Object.prototype.hasOwnProperty.call(patch, "liabilityType")) {
        const t = String(next.liabilityType ?? "").toUpperCase();
        if (t === "LOAN") {
          next.liabilityType = "LOAN";
          next.minPaymentType = "";
          next.minPaymentValueInput = "";
          next.creditLimitInput = "";
          next.dueDay = "";
          next.statementDay = "";
        } else {
          next.liabilityType = "CREDIT";
          next.originalPrincipalInput = "";
          next.maturityDate = "";
          next.paymentAmountInput = "";
          next.paymentFrequency = "";
        }
      }

      if (Object.prototype.hasOwnProperty.call(patch, "minPaymentType")) {
        const mpt = String(next.minPaymentType ?? "").toUpperCase();
        if (mpt !== "FIXED" && mpt !== "PERCENT") {
          next.minPaymentType = "";
          next.minPaymentValueInput = "";
        }
      }

      return next;
    });
  }

  async function saveEditor() {
    if (!editor) return;

    const name = String(editor.name ?? "").trim();
    const fundId = String(editor.fundId ?? "").trim();
    const accountId = String(editor.accountId ?? "").trim();
    const liabilityType = String(editor.liabilityType ?? "").trim().toUpperCase();

    if (!name) return setError("Liability name is required.");
    if (!fundId) return setError("Fund is required.");
    if (!accountId) return setError("Account location is required.");
    if (liabilityType !== "LOAN" && liabilityType !== "CREDIT") {
      return setError("Liability type must be LOAN or CREDIT.");
    }

    const aprParsed = parseOptionalApr(String(editor.aprInput ?? ""));
    if (aprParsed.error) return setError(aprParsed.error);

    const base = {
      liabilityId: editor.liabilityId,
      fundId,
      accountId,
      name,
      apr: aprParsed.value,
      openedDate: String(editor.openedDate ?? "").trim() || null,
      isActive: Boolean(editor.isActive),
      notes: String(editor.notes ?? "").trim() || null,
    } as const;

    let payload: LiabilityUpsertInput;

    if (liabilityType === "LOAN") {
      const principal = parseOptionalMoney(String(editor.originalPrincipalInput ?? ""));
      if (principal.error) return setError(`Original principal: ${principal.error}`);

      const paymentAmount = parseOptionalMoney(String(editor.paymentAmountInput ?? ""));
      if (paymentAmount.error) return setError(`Payment amount: ${paymentAmount.error}`);

      const paymentFrequency = String(editor.paymentFrequency ?? "").trim();

      payload = {
        ...base,
        liabilityType: "LOAN",
        originalPrincipal: principal.value,
        maturityDate: String(editor.maturityDate ?? "").trim() || null,
        paymentAmount: paymentAmount.value,
        paymentFrequency: paymentFrequency || null,
      } as LiabilityUpsertInput;
    } else {
      const creditLimit = parseOptionalMoney(String(editor.creditLimitInput ?? ""));
      if (creditLimit.error) return setError(`Credit limit: ${creditLimit.error}`);

      const dueDay = parseOptionalDay(String(editor.dueDay ?? ""), "Due day");
      if (dueDay.error) return setError(dueDay.error);

      const statementDay = parseOptionalDay(String(editor.statementDay ?? ""), "Statement day");
      if (statementDay.error) return setError(statementDay.error);

      const minPaymentTypeRaw = String(editor.minPaymentType ?? "").trim().toUpperCase();
      const minPaymentType =
        minPaymentTypeRaw === "FIXED" || minPaymentTypeRaw === "PERCENT"
          ? (minPaymentTypeRaw as "FIXED" | "PERCENT")
          : null;

      let minPaymentValue: number | null = null;
      if (minPaymentType === "FIXED") {
        const v = parseOptionalMoney(String(editor.minPaymentValueInput ?? ""));
        if (v.error) return setError(`Min payment value: ${v.error}`);
        if (v.value == null) return setError("Min payment value is required when min payment type is FIXED.");
        minPaymentValue = v.value;
      } else if (minPaymentType === "PERCENT") {
        const v = parsePercentInput(String(editor.minPaymentValueInput ?? ""));
        if (v.error) return setError(`Min payment value: ${v.error}`);
        if (v.value == null) return setError("Min payment value is required when min payment type is PERCENT.");
        minPaymentValue = v.value;
      }

      payload = {
        ...base,
        liabilityType: "CREDIT",
        creditLimit: creditLimit.value,
        dueDay: dueDay.value,
        minPaymentType,
        minPaymentValue,
        statementDay: statementDay.value,
      } as LiabilityUpsertInput;
    }

    setLoading(true);
    setError(null);
    try {
      await liabilitiesClient.upsert({ liability: payload } as any);
      closeEditor();
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  function requestDelete(liability: LiabilityWithBalance) {
    setDeleteTarget(liability);
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
      await liabilitiesClient.delete({ liabilityId: deleteTarget.liabilityId } as any);
      cancelDelete();
      await refresh();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  function openShow(liability: LiabilityWithBalance) {
    setShowTarget(liability);
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
    accounts: accountsAlpha,
    fundNameById,
    accountNameById,
    accountTypeNameById,
    accountCurrencyById,
    totalBalanceMinor,

    liabilities: liabilitiesSorted,
    grouped,

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
