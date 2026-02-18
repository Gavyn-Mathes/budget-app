import React, { useEffect, useMemo, useState } from "react";
import type { Category } from "../../../../../../../shared/types/category";
import type { BudgetLine, BudgetLineUpsertInput } from "../../../../../../../shared/types/budget_line";
import type { Money } from "../../../../../../../shared/types/common";
import {
  moneyInputBlurValue,
  moneyInputFocusValue,
  parseMoney,
  toMoneyInputString,
} from "../../../../utils/formatMoney";
import { Button } from "../../../../../components/ui/Button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetId: string | null;
  categories: Category[];
  existingLines: BudgetLine[];
  editing?: BudgetLine | null;
  onSave: (input: BudgetLineUpsertInput) => Promise<void> | void;
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

export function BudgetLineEditorDialog({
  open,
  onOpenChange,
  budgetId,
  categories,
  existingLines,
  editing,
  onSave,
}: Props) {
  const defaults = useMemo(() => {
    return {
      categoryId: editing?.categoryId ?? categories[0]?.categoryId ?? "",
      allocationType: editing?.allocationType ?? ("FIXED" as const),
      fixedAmount:
        editing && editing.allocationType === "FIXED"
          ? toMoneyInputString(editing.fixedAmount ?? (0 as Money))
          : "0.00",
      percent:
        editing && editing.allocationType === "PERCENT" ? percentToInput(editing.percent) : "",
    };
  }, [editing, categories]);

  const usedCategoryIds = useMemo(() => {
    return new Set(existingLines.map((line) => line.categoryId));
  }, [existingLines]);

  const availableCategories = useMemo(() => {
    return categories.filter((c) => {
      if (editing && c.categoryId === editing.categoryId) return true;
      return !usedCategoryIds.has(c.categoryId);
    });
  }, [categories, editing, usedCategoryIds]);

  const [categoryId, setCategoryId] = useState<string>(defaults.categoryId);
  const [allocationType, setAllocationType] = useState<"FIXED" | "PERCENT">(defaults.allocationType);
  const [fixedAmount, setFixedAmount] = useState<string>(defaults.fixedAmount);
  const [percent, setPercent] = useState<string>(defaults.percent);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCategoryId(defaults.categoryId);
    setAllocationType(defaults.allocationType);
    setFixedAmount(defaults.fixedAmount);
    setPercent(defaults.percent);
  }, [open, defaults]);

  useEffect(() => {
    if (!open) return;
    if (categoryId) return;
    if (availableCategories.length === 0) return;
    setCategoryId(availableCategories[0].categoryId);
  }, [open, categoryId, availableCategories]);

  useEffect(() => {
    if (!open || editing) return;
    const exists = availableCategories.some((c) => c.categoryId === categoryId);
    if (exists) return;
    setCategoryId(availableCategories[0]?.categoryId ?? "");
  }, [open, editing, availableCategories, categoryId]);

  if (!open) return null;

  let fixedMoney: Money | null = null;
  if (allocationType === "FIXED") {
    try {
      fixedMoney = parseMoney(fixedAmount);
    } catch {
      fixedMoney = null;
    }
  }

  const percentValue = allocationType === "PERCENT" ? parsePercentInput(percent) : null;

  const validBudget = Boolean(budgetId && String(budgetId).trim().length > 0);
  const validCategory = String(categoryId ?? "").trim().length > 0;
  const validAllocation =
    allocationType === "FIXED"
      ? fixedMoney !== null && (fixedMoney as number) >= 0
      : percentValue !== null;

  const valid = validBudget && validCategory && validAllocation;

  async function handleSave() {
    if (!valid || saving || !budgetId) return;

    const input: BudgetLineUpsertInput = {
      budgetId,
      categoryId,
      allocationType,
      fixedAmount: allocationType === "FIXED" ? (fixedMoney as Money) : null,
      percent: allocationType === "PERCENT" ? (percentValue as number) : null,
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
            {editing ? "Edit Category Allocation" : "Add Category Allocation"}
          </div>
          <button className="distDialog__close" onClick={() => onOpenChange(false)}>
            x
          </button>
        </div>

        <div className="distDialog__body">
          <label className="distDialog__label">
            Category
            <select
              className="distDialog__input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={Boolean(editing)}
            >
              <option value="">Select category</option>
              {availableCategories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="distDialog__label">
            Allocation type
            <select
              className="distDialog__input"
              value={allocationType}
              onChange={(e) => setAllocationType(e.target.value as "FIXED" | "PERCENT")}
            >
              <option value="FIXED">FIXED</option>
              <option value="PERCENT">PERCENT</option>
            </select>
          </label>

          {allocationType === "FIXED" ? (
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

          {availableCategories.length === 0 && !editing ? (
            <div className="distDialog__hint">
              All categories already have an allocation for this month.
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
