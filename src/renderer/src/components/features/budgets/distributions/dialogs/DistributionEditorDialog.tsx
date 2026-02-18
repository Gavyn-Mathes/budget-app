// src/renderer/src/components/features/budgets/distributions/dialogs/DistributionEditorDialog.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { DistributionRule, DistributionRuleUpsertInput } from "../../../../../../../shared/types/distribution";
import type { Category } from "../../../../../../../shared/types/category";
import type { Fund } from "../../../../../../../shared/types/fund";
import type { Asset } from "../../../../../../../shared/types/asset";
import { Button } from "../../../../../components/ui/Button";
import {
  moneyInputBlurValue,
  moneyInputFocusValue,
  parseMoney,
  toMoneyInputString,
} from "../../../../utils/formatMoney";
import type { Money } from "../../../../../../../shared/types/common";
import { isCashAsset } from "../../../../../../../shared/types/asset";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetId: string | null;
  categories: Category[];
  funds: Fund[];
  cashAssetsByFund: Map<string, Asset[]>;
  editing?: DistributionRule | null;
  onSave: (input: DistributionRuleUpsertInput) => Promise<void> | void;
};

function percentToInput(p: number | null | undefined): string {
  if (p == null || !Number.isFinite(p)) return "";
  const pct = p * 100;
  const rounded = Math.round(pct * 100) / 100;
  return String(rounded);
}

function parsePercentInput(s: string): number | null {
  const raw = s.trim();
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  if (n < 0 || n > 100) return null;
  return n / 100;
}

export function DistributionEditorDialog({
  open,
  onOpenChange,
  budgetId,
  categories,
  funds,
  cashAssetsByFund,
  editing,
  onSave,
}: Props) {
  const defaults = useMemo(() => {
    const defaultFundId = editing?.fundId ?? funds[0]?.fundId ?? "";
    const defaultCategoryId = editing?.categoryId ?? categories[0]?.categoryId ?? "";
    const defaultSourceType = (editing?.sourceType ?? "CATEGORY") as "SURPLUS" | "CATEGORY";
    const defaultAllocationType =
      defaultSourceType === "CATEGORY"
        ? "PERCENT"
        : (editing?.allocationType ?? "FIXED");

    return {
      sourceType: defaultSourceType,
      categoryId: defaultCategoryId,
      fundId: defaultFundId,
      assetId: editing?.assetId ?? "",
      allocationType: defaultAllocationType as "FIXED" | "PERCENT",
      fixedAmount:
        editing && editing.allocationType === "FIXED"
          ? toMoneyInputString(editing.fixedAmount ?? (0 as Money))
          : "0.00",
      percent:
        editing && editing.allocationType === "PERCENT"
          ? percentToInput(editing.percent)
          : defaultSourceType === "CATEGORY"
            ? "0"
            : "",
    };
  }, [editing, funds, categories]);

  const [sourceType, setSourceType] = useState<"SURPLUS" | "CATEGORY">(defaults.sourceType);
  const [categoryId, setCategoryId] = useState(defaults.categoryId);
  const [fundId, setFundId] = useState(defaults.fundId);
  const [assetId, setAssetId] = useState(defaults.assetId);
  const [allocationType, setAllocationType] = useState<"FIXED" | "PERCENT">(
    defaults.allocationType
  );
  const [fixedAmount, setFixedAmount] = useState(defaults.fixedAmount);
  const [percent, setPercent] = useState(defaults.percent);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSourceType(defaults.sourceType);
    setCategoryId(defaults.categoryId);
    setFundId(defaults.fundId);
    setAssetId(defaults.assetId);
    setAllocationType(defaults.allocationType);
    setFixedAmount(defaults.fixedAmount);
    setPercent(defaults.percent);
  }, [open, defaults]);

  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].categoryId);
    }
  }, [categoryId, categories]);

  useEffect(() => {
    if (sourceType !== "CATEGORY") return;
    if (allocationType !== "PERCENT") setAllocationType("PERCENT");
    if (!percent.trim()) setPercent("0");
  }, [sourceType, allocationType, percent]);

  const cashAssets = useMemo(() => {
    const list = cashAssetsByFund.get(fundId) ?? [];
    return list.filter((a) => isCashAsset(a));
  }, [cashAssetsByFund, fundId]);

  useEffect(() => {
    if (!assetId) return;
    if (!cashAssets.find((a) => a.assetId === assetId)) {
      setAssetId("");
    }
  }, [assetId, cashAssets]);

  if (!open) return null;

  const effectiveAllocationType: "FIXED" | "PERCENT" =
    sourceType === "CATEGORY" ? "PERCENT" : allocationType;

  let fixedMoney: Money | null = null;
  if (effectiveAllocationType === "FIXED") {
    try {
      fixedMoney = parseMoney(fixedAmount);
    } catch {
      fixedMoney = null;
    }
  }

  const percentValue =
    effectiveAllocationType === "PERCENT" ? parsePercentInput(percent) : null;

  const validBudget = Boolean(budgetId && String(budgetId).trim().length > 0);
  const validFund = String(fundId ?? "").trim().length > 0;
  const validCategory =
    sourceType === "CATEGORY" ? String(categoryId ?? "").trim().length > 0 : true;
  const validAllocation =
    effectiveAllocationType === "FIXED"
      ? fixedMoney !== null && (fixedMoney as number) >= 0
      : percentValue !== null;

  const valid = validBudget && validFund && validCategory && validAllocation;

  async function handleSave() {
    if (!valid || saving || !budgetId) return;

    const base = {
      budgetId,
      distributionRuleId: editing?.distributionRuleId,
      fundId,
      assetId: assetId ? assetId : null,
      sourceType,
      categoryId: sourceType === "CATEGORY" ? categoryId : null,
    };

    const input: DistributionRuleUpsertInput =
      effectiveAllocationType === "FIXED"
        ? {
            ...base,
            allocationType: "FIXED",
            fixedAmount: fixedMoney as Money,
            percent: null,
          }
        : {
            ...base,
            allocationType: "PERCENT",
            fixedAmount: null,
            percent: percentValue as number,
          };

    try {
      setSaving(true);
      await onSave(input);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="distDialog__backdrop" onClick={() => onOpenChange(false)}>
      <div className="distDialog__panel" onClick={(e) => e.stopPropagation()}>
        <div className="distDialog__header">
          <div className="distDialog__title">
            {editing ? "Edit Distribution Rule" : "Add Distribution Rule"}
          </div>
          <button className="distDialog__close" onClick={() => onOpenChange(false)}>
            x
          </button>
        </div>

        <div className="distDialog__body">
          <label className="distDialog__label">
            Source type
            <select
              className="distDialog__input"
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as "SURPLUS" | "CATEGORY")}
            >
              <option value="CATEGORY">CATEGORY</option>
              <option value="SURPLUS">SURPLUS</option>
            </select>
          </label>

          <label className="distDialog__label">
            Category
            <select
              className="distDialog__input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={sourceType !== "CATEGORY"}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="distDialog__label">
            Fund
            <select
              className="distDialog__input"
              value={fundId}
              onChange={(e) => {
                setFundId(e.target.value);
                setAssetId("");
              }}
            >
              <option value="">Select fund</option>
              {funds.map((f) => (
                <option key={f.fundId} value={f.fundId}>
                  {f.name ?? f.fundId}
                </option>
              ))}
            </select>
          </label>

          <label className="distDialog__label">
            Asset (optional)
            <select
              className="distDialog__input"
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              disabled={!fundId}
            >
              <option value="">Auto (single cash asset)</option>
              {cashAssets.map((a) => (
                <option key={a.assetId} value={a.assetId}>
                  {a.name ?? a.assetId}
                </option>
              ))}
            </select>
          </label>

          <label className="distDialog__label">
            Allocation type
            <select
              className="distDialog__input"
              value={effectiveAllocationType}
              onChange={(e) => setAllocationType(e.target.value as "FIXED" | "PERCENT")}
              disabled={sourceType === "CATEGORY"}
            >
              {sourceType === "CATEGORY" ? (
                <option value="PERCENT">PERCENT</option>
              ) : (
                <>
                  <option value="FIXED">FIXED</option>
                  <option value="PERCENT">PERCENT</option>
                </>
              )}
            </select>
          </label>

          {effectiveAllocationType === "FIXED" ? (
            <label className="distDialog__label">
              Fixed amount
              <input
                className="distDialog__input"
                value={fixedAmount}
                onChange={(e) => setFixedAmount(e.target.value)}
                onFocus={() => setFixedAmount((prev) => moneyInputFocusValue(prev))}
                onBlur={() => setFixedAmount((prev) => moneyInputBlurValue(prev))}
                inputMode="decimal"
                placeholder="0.00"
              />
            </label>
          ) : (
            <label className="distDialog__label">
              Percent (0-100)
              <input
                className="distDialog__input"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                inputMode="decimal"
                placeholder="0"
              />
            </label>
          )}

          {!cashAssets.length && fundId ? (
            <div className="distDialog__hint">
              No cash assets found for this fund. Auto selection may fail if the fund has none.
            </div>
          ) : null}
        </div>

        <div className="distDialog__footer">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!valid || saving} onClick={handleSave}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
