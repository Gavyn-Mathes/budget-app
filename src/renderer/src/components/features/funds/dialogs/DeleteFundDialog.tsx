// src/renderer/src/components/features/funds/dialogs/DeleteFundDialog.tsx
import React from "react";
import { Button } from "../../../ui/Button";
import { useFundsPage } from "../hooks/useFundsPage";

export function DeleteFundDialog({ vm }: { vm: ReturnType<typeof useFundsPage> }) {
  const t = vm.deleteTarget;
  if (!vm.deleteOpen || !t) return null;

  return (
    <div className="fundsDialog__backdrop" onMouseDown={vm.cancelDelete}>
      <div className="fundsDialog__panel" onMouseDown={(ev) => ev.stopPropagation()}>
        <div className="fundsDialog__header">
          <div className="fundsDialog__title">Delete fund?</div>
          <button className="fundsDialog__close" onClick={vm.cancelDelete} aria-label="Close">
            x
          </button>
        </div>

        <div className="fundsDialog__body">
          This will delete <b>{(t as any).name}</b>.
        </div>

        <div className="fundsDialog__footer">
          <Button onClick={vm.cancelDelete} disabled={vm.loading}>
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
