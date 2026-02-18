// src/renderer/src/components/features/budgets/income/dialogs/IncomesEditorDialog.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { Income, IncomeUpsertInput } from "../../../../../../../shared/types/income";
import { Button } from "../../../../../components/ui/Button";
import { currentMonthKey, defaultDateForMonth, isValidMonthKey, todayIsoDate } from "../../../../utils/month";
import {
  moneyInputBlurValue,
  moneyInputFocusValue,
  parseMoney,
  toMoneyInputString,
} from "../../../../utils/formatMoney";
import type { Money } from "../../../../../../../shared/types/common";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  incomeMonthKey: string;

  editing?: Income | null;

  onSave: (input: IncomeUpsertInput) => Promise<void> | void;
};

export function IncomeEditorDialog({
  open,
  onOpenChange,
  incomeMonthKey,
  editing,
  onSave,
}: Props) {
  const defaults = useMemo(() => {
    return {
      name: editing?.name ?? "",
      date:
        editing?.date ??
        (isValidMonthKey(incomeMonthKey)
          ? defaultDateForMonth(incomeMonthKey)
          : todayIsoDate()),
      amount: editing ? toMoneyInputString(editing.amount) : "0.00",
      notes: editing?.notes ?? "",
      monthKey: incomeMonthKey || currentMonthKey(),
    };
  }, [editing, incomeMonthKey]);

  const [name, setName] = useState(defaults.name);
  const [date, setDate] = useState(defaults.date);
  const [amount, setAmount] = useState(defaults.amount);
  const [notes, setNotes] = useState(defaults.notes ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(defaults.name);
    setDate(defaults.date);
    setAmount(defaults.amount);
    setNotes(defaults.notes ?? "");
  }, [open, defaults]);

  if (!open) return null;

  let amt: Money | null = null;
  try {
    amt = parseMoney(amount); // returns Money (minor int)
  } catch {
    amt = null;
  }

  const valid =
    name.trim().length > 0 &&
    date.trim().length > 0 &&
    amt !== null &&
    (amt as number) >= 0;

  async function handleSave() {
    if (!valid || saving || amt === null) return;

    const input: IncomeUpsertInput = {
      incomeMonthKey: defaults.monthKey,
      name: name.trim(),
      date,
      amount: amt, 
      notes: notes.trim().length ? notes.trim() : null,
      ...(editing?.incomeId ? { incomeId: editing.incomeId } : {}),
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
    <div className="incomeDialog__backdrop" onClick={() => onOpenChange(false)}>
      <div className="incomeDialog__panel" onClick={(e) => e.stopPropagation()}>
        <div className="incomeDialog__header">
          <div className="incomeDialog__title">{editing ? "Edit Income" : "Add Income"}</div>
          <button className="incomeDialog__close" onClick={() => onOpenChange(false)}>
            ×
          </button>
        </div>

        <div className="incomeDialog__body">
          <label className="incomeDialog__label">
            Name
            <input
              className="incomeDialog__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Paycheck, VA stipend"
            />
          </label>

          <label className="incomeDialog__label">
            Date
            <input
              className="incomeDialog__input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
            />
          </label>

          <label className="incomeDialog__label">
            Amount
            <input
              className="incomeDialog__input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onFocus={() => setAmount((prev) => moneyInputFocusValue(prev))}
              onBlur={() => setAmount((prev) => moneyInputBlurValue(prev))}
              inputMode="decimal"
              placeholder="0.00"
            />
          </label>

          <label className="incomeDialog__label">
            Notes (optional)
            <input
              className="incomeDialog__input"
              value={notes ?? ""}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
            />
          </label>
        </div>

        <div className="incomeDialog__footer">
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
