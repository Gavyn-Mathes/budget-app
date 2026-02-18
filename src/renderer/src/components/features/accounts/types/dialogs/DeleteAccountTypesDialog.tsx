// src/renderer/src/components/features/accounts/types/dialogs/DeleteAccountTypesDialog.tsx
import React from "react";
import { Button } from "../../../../../components/ui/Button";
import { useAccountTypesPage } from "../hooks/useAccountTypesPage";

export function DeleteAccountTypesDialog({ vm }: { vm: ReturnType<typeof useAccountTypesPage> }) {
  if (!vm.deleteOpen || !vm.deleteTarget) return null;

  const t: any = vm.deleteTarget;

  return (
    <div className="modalBackdrop" onClick={vm.cancelDelete} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal__header">
          <div className="modal__title">Delete Account Type</div>
        </div>

        <div className="modal__body">
          Are you sure you want to delete <b>{t.accountType}</b>?
        </div>

        <div className="modal__footer">
          <Button variant="ghost" onClick={vm.cancelDelete} disabled={vm.loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={vm.confirmDelete} disabled={vm.loading}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
