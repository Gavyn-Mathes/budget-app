// src/renderer/src/components/features/accounts/dialogs/DeleteAccountDialog.tsx
import React from "react";
import { Button } from "../../../ui/Button";
import { useAccountsPage } from "../hooks/useAccountsPage";
import "../../../ui/Modal.css";

export function DeleteAccountDialog({ vm }: { vm: ReturnType<typeof useAccountsPage> }) {
  if (!vm.deleteOpen || !vm.deleteTarget) return null;

  const a: any = vm.deleteTarget;

  return (
    <div className="modalBackdrop" onClick={vm.cancelDelete} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal__header">
          <div className="modal__title">Delete Account</div>
        </div>

        <div className="modal__body">
          Are you sure you want to delete <b>{a.name}</b>?
        </div>

        <div className="modal__footer">
          <Button variant="ghost" onClick={vm.cancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={vm.confirmDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
