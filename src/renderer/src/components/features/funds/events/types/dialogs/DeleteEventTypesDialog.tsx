// src/renderer/src/components/features/funds/events/types/dialogs/DeleteEventTypeDialog.tsx
import React from "react";
import { Button } from "../../../../../ui/Button";
import { useEventTypesPage } from "../hooks/useEventTypesPage";

export function DeleteEventTypeDialog({ vm }: { vm: ReturnType<typeof useEventTypesPage> }) {
  if (!vm.deleteOpen || !vm.deleteTarget) return null;

  return (
    <div className="modalBackdrop" onClick={vm.cancelDelete} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal__header">
          <div className="modal__title">Delete Event Type</div>
        </div>

        <div className="modal__body">
          Are you sure you want to delete <b>{vm.deleteTarget.eventType}</b>?
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
