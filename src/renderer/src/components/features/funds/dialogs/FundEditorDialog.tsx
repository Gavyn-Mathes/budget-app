// src/renderer/src/components/features/funds/dialogs/FundEditorDialog.tsx
import React from "react";
import { Button } from "../../../ui/Button";
import { useFundsPage } from "../hooks/useFundsPage";

export function FundEditorDialog({ vm }: { vm: ReturnType<typeof useFundsPage> }) {
  const e = vm.editor;
  if (!vm.editorOpen || !e) return null;

  const name = String((e as any).name ?? "").trim();

  return (
    <div className="fundsDialog__backdrop" onMouseDown={vm.closeEditor}>
      <div className="fundsDialog__panel" onMouseDown={(ev) => ev.stopPropagation()}>
        <div className="fundsDialog__header">
          <div className="fundsDialog__title">{(e as any).fundId ? "Edit Fund" : "Add Fund"}</div>
          <button className="fundsDialog__close" onClick={vm.closeEditor} aria-label="Close">
            x
          </button>
        </div>

        <div className="fundsDialog__body">
          <div className="fundsForm">
            <label className="fundsField">
              <span>Name</span>
              <input
                value={(e as any).name ?? ""}
                onChange={(ev) => vm.patchEditor({ name: ev.target.value } as any)}
                placeholder="Emergency, Rent, Travel..."
              />
            </label>

            <label className="fundsField">
              <span>Description</span>
              <textarea
                rows={3}
                value={(e as any).description ?? ""}
                onChange={(ev) => vm.patchEditor({ description: ev.target.value } as any)}
                placeholder="Optional"
              />
            </label>
          </div>
        </div>

        <div className="fundsDialog__footer">
          <Button onClick={vm.closeEditor} disabled={vm.loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={vm.saveEditor} disabled={vm.loading || !name}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
