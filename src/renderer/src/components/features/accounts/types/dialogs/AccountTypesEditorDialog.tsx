// src/renderer/src/components/features/accounts/types/dialogs/AccountTypesEditorDialog.tsx
import React from "react";
import { Button } from "../../../../../components/ui/Button";
import { useAccountTypesPage } from "../hooks/useAccountTypesPage";

export function AccountTypesEditorDialog({ vm }: { vm: ReturnType<typeof useAccountTypesPage> }) {
  if (!vm.editorOpen || !vm.editor) return null;

  const e: any = vm.editor;
  const isEdit = !!e.accountTypeId;

  return (
    <div className="modalBackdrop" onClick={vm.closeEditor} role="presentation">
      <div className="modal" onClick={(x) => x.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal__header">
          <div className="modal__title">{isEdit ? "Edit Account Type" : "Create Account Type"}</div>
        </div>

        <div className="modal__body">
          <label className="modal__field">
            <div className="modal__label">Type</div>
            <input
              value={e.accountType ?? ""}
              onChange={(ev) => vm.patchEditor({ accountType: ev.target.value } as any)}
              placeholder="Checking, Savings, Credit Card..."
            />
          </label>
        </div>

        <div className="modal__footer">
          <Button variant="ghost" onClick={vm.closeEditor} disabled={vm.loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={vm.saveEditor} disabled={vm.loading}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
