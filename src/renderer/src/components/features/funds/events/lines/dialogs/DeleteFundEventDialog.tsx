// src/renderer/src/components/features/funds/events/lines/dialogs/DeleteFundEventDialog.tsx
import React from "react";
import { Button } from "../../../../../../components/ui/Button";
import { useFundEventsLinesPage } from "../hooks/useFundEventsLinesPage";

export function DeleteFundEventDialog({ vm }: { vm: ReturnType<typeof useFundEventsLinesPage> }) {
  if (!vm.deleteOpen || !vm.selected) return null;

  return (
    <div className="modalBackdrop" onClick={vm.cancelDelete} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal__header">
          <div className="modal__title">Delete Fund Event</div>
        </div>

        {vm.dialogError ? <div className="modal__error">Error: {vm.dialogError}</div> : null}

        <div className="modal__body">
          Are you sure you want to delete event <b>{vm.selected.event.eventId}</b> on{" "}
          <b>{vm.selected.event.eventDate}</b>?
        </div>

        <div className="modal__footer">
          <Button variant="ghost" onClick={vm.cancelDelete} disabled={vm.busy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={vm.confirmDelete} disabled={vm.busy}>
            {vm.busy ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
