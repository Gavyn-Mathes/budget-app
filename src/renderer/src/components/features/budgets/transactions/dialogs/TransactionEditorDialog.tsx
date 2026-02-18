// renderer/src/components/features/budgets/transactions/dialogs/TransactionEditorDialog.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { Category } from "../../../../../../../shared/types/category";
import type { Transaction } from "../../../../../../../shared/types/transaction";
import { Button } from "../../../../../components/ui/Button";
import type { TxEditorDraft } from "../hooks/useTransactionsPage";
import {
  moneyInputBlurValue,
  moneyInputFocusValue,
  parseMoney,
  toMoneyInputString,
} from "../../../../utils/formatMoney";
import { defaultDateForMonth, isValidMonthKey } from "../../../../utils/month";
import type { Money } from "../../../../../../../shared/types/common";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monthKey: string;

  categories: Category[];

  editing?: Transaction | null;

  onSave: (draft: TxEditorDraft) => Promise<void> | void;
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionEditorDialog({
  open,
  onOpenChange,
  monthKey,
  categories,
  editing,
  onSave,
}: Props) {
  const defaults = useMemo(() => {
    const amountStr = editing ? toMoneyInputString(editing.amount) : "0.00";

    return {
      categoryId: editing?.categoryId ?? (categories[0]?.categoryId ?? ""),
      date:
        editing?.date ??
        (isValidMonthKey(monthKey) ? defaultDateForMonth(monthKey) : todayIsoDate()),
      amount: amountStr,
      notes: editing?.notes ?? "",
    };
  }, [editing, categories, monthKey]);

  const [categoryId, setCategoryId] = useState(defaults.categoryId);
  const [date, setDate] = useState(defaults.date);
  const [amount, setAmount] = useState(defaults.amount);
  const [notes, setNotes] = useState(defaults.notes ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCategoryId(defaults.categoryId);
    setDate(defaults.date);
    setAmount(defaults.amount);
    setNotes(defaults.notes ?? "");
  }, [open, defaults]);

  if (!open) return null;

  let amt: Money | null = null;
  try {
    amt = parseMoney(amount);
  } catch {
    amt = null;
  }

  const valid =
    !!categoryId &&
    date.trim().length > 0 &&
    amt !== null &&
    (amt as number) >= 0;

  async function handleSave() {
    if (!valid || saving || amt === null) return;

    try {
      setSaving(true);
      await onSave({
        transactionId: editing?.transactionId,
        categoryId,
        date,
        amount: amt,
        notes: notes.trim().length ? notes.trim() : null,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="txDialog__backdrop" onClick={() => onOpenChange(false)}>
      <div className="txDialog__panel" onClick={(e) => e.stopPropagation()}>
        <div className="txDialog__header">
          <div className="txDialog__title">{editing ? "Edit Transaction" : "Add Transaction"}</div>
          <button className="txDialog__close" onClick={() => onOpenChange(false)}>
            ×
          </button>
        </div>

        <div className="txDialog__body">
          <label className="txDialog__label">
            Category
            <select
              className="txDialog__input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="" disabled>
                Select…
              </option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="txDialog__label">
            Date
            <input
              className="txDialog__input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          <label className="txDialog__label">
            Amount
            <input
              className="txDialog__input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onFocus={() => setAmount((prev) => moneyInputFocusValue(prev))}
              onBlur={() => setAmount((prev) => moneyInputBlurValue(prev))}
              inputMode="decimal"
              placeholder="0.00"
            />
          </label>

          <label className="txDialog__label">
            Notes (optional)
            <input
              className="txDialog__input"
              value={notes ?? ""}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
            />
          </label>

          {categories.length === 0 ? (
            <div className="txDialog__hint">
              You have no categories yet — add one in Budgets → Categories first.
            </div>
          ) : null}
        </div>

        <div className="txDialog__footer">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!valid || saving} onClick={handleSave}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
