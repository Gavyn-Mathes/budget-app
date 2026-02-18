// src/renderer/src/components/features/funds/events/dialogs/FundEventEditorDialog.tsx
import React from "react";
import { Button } from "../../../../../../components/ui/Button";
import { FundEventLinesTable } from "../components/FundEventLinesTable";
import { useFundEventsLinesPage } from "../hooks/useFundEventsLinesPage";

function eventTypeOptionLabel(eventType: any): string {
  return String(eventType?.eventType ?? eventType?.eventTypeId ?? "");
}

export function EditFundEventDialog({ vm }: { vm: ReturnType<typeof useFundEventsLinesPage> }) {
  if (!vm.editOpen) return null;

  return (
    <div className="modalBackdrop" onClick={vm.cancelEdit} role="presentation">
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal__header">
          <div>
            <div className="modal__title">Edit Fund Event</div>
            <div className="modal__subtitle">Edit the event. Lines are read-only in this version.</div>
          </div>
        </div>

        {vm.dialogError ? <div className="modal__error">Error: {vm.dialogError}</div> : null}
        {vm.metaError ? <div className="modal__error">Meta: {vm.metaError}</div> : null}

        <div className="modal__body">
          {!vm.selected ? (
            <div className="modal__muted">No event loaded.</div>
          ) : (
            <>
              {/* Event header summary */}
              <div className="modal__sectionHeader">
                <div className="modal__sectionTitle">Event</div>
                <div className="modal__muted">
                  ID: <b>{vm.selected.event.eventId}</b>
                </div>
              </div>

              {/* Editable event fields */}
              <div className="modal__grid2">
                <label className="modal__field">
                  <div className="modal__label">Event Date</div>
                  <input type="date" value={vm.editEventDate} onChange={(e) => vm.setEditEventDate(e.target.value)} />
                </label>

                <label className="modal__field">
                  <div className="modal__label">Event Type</div>
                  <select
                    value={vm.editEventTypeId}
                    onChange={(e) => vm.setEditEventTypeId(e.target.value)}
                    disabled={vm.metaLoading || vm.eventTypes.length === 0}
                  >
                    <option value="">Select event type</option>
                    {vm.eventTypes.map((eventType: any) => (
                      <option key={eventType.eventTypeId} value={eventType.eventTypeId}>
                        {eventTypeOptionLabel(eventType)}
                      </option>
                    ))}
                    {!vm.eventTypes.some((eventType: any) => eventType.eventTypeId === vm.editEventTypeId) &&
                    vm.editEventTypeId ? (
                      <option value={vm.editEventTypeId}>{vm.editEventTypeId}</option>
                    ) : null}
                  </select>
                </label>
              </div>

              <label className="modal__field">
                <div className="modal__label">Memo</div>
                <textarea value={vm.editMemo} onChange={(e) => vm.setEditMemo(e.target.value)} />
              </label>

              {/* Lines header + table */}
              <div className="modal__sectionHeader" style={{ marginTop: 12 }}>
                <div className="modal__sectionTitle">Lines</div>
                <div className="modal__muted">
                  {vm.selected.lines.length} line{vm.selected.lines.length === 1 ? "" : "s"}
                </div>
              </div>

              <FundEventLinesTable lines={vm.selected.lines} />
            </>
          )}
        </div>

        <div className="modal__footer">
          <Button variant="ghost" onClick={vm.cancelEdit} disabled={vm.busy}>
            Cancel
          </Button>
          <Button variant="primary" onClick={vm.confirmEdit} disabled={vm.busy || !vm.selected}>
            {vm.busy ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
