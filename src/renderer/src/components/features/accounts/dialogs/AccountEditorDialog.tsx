// src/renderer/src/components/features/accounts/dialogs/AccountEditorDialog.tsx
import React from "react";
import { Button } from "../../../ui/Button";
import { useAccountsPage } from "../hooks/useAccountsPage";
import "../../../ui/Modal.css";

export function AccountEditorDialog({ vm }: { vm: ReturnType<typeof useAccountsPage> }) {
  if (!vm.editorOpen || !vm.editor) return null;

  const e: any = vm.editor;
  const isEdit = !!e.accountId;
  const accountTypes = vm.accountTypes ?? [];
  const hasTypes = accountTypes.length > 0;

  return (
    <div className="modalBackdrop" onClick={vm.closeEditor} role="presentation">
      <div className="modal" onClick={(x) => x.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal__header">
          <div className="modal__title">{isEdit ? "Edit Account" : "Create Account"}</div>
        </div>

        <div className="modal__body">
          <label className="modal__field">
            <div className="modal__label">Name</div>
            <input
              value={e.name ?? ""}
              onChange={(ev) => vm.patchEditor({ name: ev.target.value } as any)}
              placeholder="Checking, Brokerage, Credit Card..."
            />
          </label>

          <label className="modal__field">
            <div className="modal__label">Account Type</div>
            <select
              value={e.accountTypeId ?? ""}
              onChange={(ev) => vm.patchEditor({ accountTypeId: ev.target.value } as any)}
              disabled={!hasTypes}
            >
              {hasTypes ? null : <option value="">No account types</option>}
              {accountTypes.map((t: any) => (
                <option key={t.accountTypeId} value={t.accountTypeId}>
                  {t.accountType}
                </option>
              ))}
            </select>
          </label>

          <label className="modal__field">
            <div className="modal__label">Default Currency</div>
            <input
              value={e.defaultCurrencyCode ?? ""}
              onChange={(ev) => vm.patchEditor({ defaultCurrencyCode: ev.target.value } as any)}
              placeholder="USD"
            />
          </label>

          <label className="modal__field">
            <div className="modal__label">Description</div>
            <textarea
              value={e.description ?? ""}
              onChange={(ev) => vm.patchEditor({ description: ev.target.value } as any)}
              placeholder="Optional"
            />
          </label>
        </div>

        <div className="modal__footer">
          <Button variant="ghost" onClick={vm.closeEditor}>
            Cancel
          </Button>
          <Button variant="primary" onClick={vm.saveEditor}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
