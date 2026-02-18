// src/renderer/src/components/features/funds/liabilities/dialogs/DeleteLiabilityDialog.tsx
import React from "react";
import { Button } from "../../../../../components/ui/Button";
import { useFundsLiabilitiesPage } from "../hooks/useFundsLiabilitiesPage";

export function DeleteLiabilityDialog({ vm }: { vm: ReturnType<typeof useFundsLiabilitiesPage> }) {
  const t = vm.deleteTarget;
  if (!vm.deleteOpen || !t) return null;

  return (
    <div className="fundsDialog__backdrop" onMouseDown={vm.cancelDelete}>
      <div className="fundsDialog__panel" onMouseDown={(ev) => ev.stopPropagation()}>
        <div className="fundsDialog__header">
          <div className="fundsDialog__title">Delete liability?</div>
          <button className="fundsDialog__close" onClick={vm.cancelDelete} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="fundsDialog__body">
          This will delete <b>{String((t as any).name ?? "")}</b>.
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
