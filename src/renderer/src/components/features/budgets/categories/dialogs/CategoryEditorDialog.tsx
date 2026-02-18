// src/renderer/src/components/features/budgets/categories/dialogs/CategoryEditorDialog.tsx
import React, { useEffect, useMemo, useState } from "react";
import type { Category, CategoryUpsertInput } from "../../../../../../../shared/types/category";
import { Button } from "../../../../../components/ui/Button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: Category | null;
  onSave: (input: CategoryUpsertInput) => Promise<void> | void;
};

export function CategoryEditorDialog({ open, onOpenChange, editing, onSave }: Props) {
  const defaults = useMemo(() => ({ name: editing?.name ?? "" }), [editing]);

  const [name, setName] = useState(defaults.name);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(defaults.name);
  }, [open, defaults]);

  if (!open) return null;

  const valid = name.trim().length > 0;

  async function handleSave() {
    if (!valid || saving) return;
    try {
      setSaving(true);
      const input: CategoryUpsertInput = {
        name: name.trim(),
        ...(editing?.categoryId ? { categoryId: editing.categoryId } : {}),
      };
      await onSave(input);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="catDialog__backdrop" onClick={() => onOpenChange(false)}>
      <div className="catDialog__panel" onClick={(e) => e.stopPropagation()}>
        <div className="catDialog__header">
          <div className="catDialog__title">{editing ? "Rename Category" : "Add Category"}</div>
          <button className="catDialog__close" onClick={() => onOpenChange(false)}>
            ×
          </button>
        </div>

        <div className="catDialog__body">
          <label className="catDialog__label">
            Name
            <input
              className="catDialog__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Rent, Groceries"
              autoFocus
            />
          </label>
          <div className="catDialog__hint">
            Tip: names must be unique.
          </div>
        </div>

        <div className="catDialog__footer">
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
