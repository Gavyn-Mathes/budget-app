// src/renderer/src/components/features/funds/events/lines/dialogs/CreateFundEventDialog.tsx
import React from "react";
import { Button } from "../../../../../../components/ui/Button";
import { useFundEventsLinesPage } from "../hooks/useFundEventsLinesPage";

function eventTypeOptionLabel(eventType: any): string {
  return String(eventType?.eventType ?? eventType?.eventTypeId ?? "");
}

function assetOptionLabel(asset: any): string {
  const name = String(asset?.name ?? "").trim();
  const type = String(asset?.assetType ?? "").trim();
  const id = String(asset?.assetId ?? "").trim();
  return name ? `${name}${type ? ` (${type})` : ""}` : id;
}

function liabilityOptionLabel(liability: any): string {
  const name = String(liability?.name ?? "").trim();
  const type = String(liability?.liabilityType ?? "").trim();
  const id = String(liability?.liabilityId ?? "").trim();
  return name ? `${name}${type ? ` (${type})` : ""}` : id;
}

export function CreateFundEventDialog({ vm }: { vm: ReturnType<typeof useFundEventsLinesPage> }) {
  if (!vm.createOpen) return null;

  return (
    <div className="modalBackdrop" onClick={vm.cancelCreate} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal__header">
          <div className="modal__title">Create Fund Event</div>
        </div>

        {vm.dialogError ? <div className="modal__error">Error: {vm.dialogError}</div> : null}
        {vm.metaError ? <div className="modal__error">Meta: {vm.metaError}</div> : null}

        <div className="modal__body">
          <label className="modal__field">
            <div className="modal__label">Event Date</div>
            <input type="date" value={vm.createEventDate} onChange={(e) => vm.setCreateEventDate(e.target.value)} />
          </label>

          <label className="modal__field">
            <div className="modal__label">Event Type</div>
            <select
              value={vm.createEventTypeId}
              onChange={(e) => vm.setCreateEventTypeId(e.target.value)}
              disabled={vm.metaLoading || vm.eventTypes.length === 0}
            >
              <option value="">Select event type</option>
              {vm.eventTypes.map((eventType: any) => (
                <option key={eventType.eventTypeId} value={eventType.eventTypeId}>
                  {eventTypeOptionLabel(eventType)}
                </option>
              ))}
            </select>
          </label>

          <label className="modal__field">
            <div className="modal__label">Memo</div>
            <textarea value={vm.createMemo} onChange={(e) => vm.setCreateMemo(e.target.value)} />
          </label>

          <div className="modal__row">
            <div className="modal__label">Lines</div>
            <Button variant="ghost" onClick={vm.addCreateLine}>
              + Add Line
            </Button>
          </div>

          {vm.createLines.map((line, i) => (
            <div key={i} className="modal__line">
              <div className="modal__row">
                <b>Line {i + 1}</b>
                <Button
                  variant="danger"
                  onClick={() => vm.removeCreateLine(i)}
                  disabled={vm.createLines.length === 1}
                >
                  Remove
                </Button>
              </div>

              <label className="modal__field">
                <div className="modal__label">Kind</div>
                <select
                  value={line.lineKind}
                  onChange={(e) =>
                    vm.patchCreateLine(i, {
                      lineKind: e.target.value as any,
                      assetId: "",
                      liabilityId: "",
                      quantityDeltaMinor: "",
                      moneyDelta: "",
                    })
                  }
                >
                  <option value="ASSET_QUANTITY">ASSET_QUANTITY</option>
                  <option value="ASSET_MONEY">ASSET_MONEY</option>
                  <option value="LIABILITY_MONEY">LIABILITY_MONEY</option>
                </select>
              </label>

              {line.lineKind === "LIABILITY_MONEY" ? (
                <label className="modal__field">
                  <div className="modal__label">Liability</div>
                  <select
                    value={line.liabilityId}
                    onChange={(e) => vm.patchCreateLine(i, { liabilityId: e.target.value })}
                  >
                    <option value="">Select liability</option>
                    {vm.liabilities.map((liability: any) => (
                      <option key={liability.liabilityId} value={liability.liabilityId}>
                        {liabilityOptionLabel(liability)}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="modal__field">
                  <div className="modal__label">Asset</div>
                  <select
                    value={line.assetId}
                    onChange={(e) => vm.patchCreateLine(i, { assetId: e.target.value })}
                  >
                    <option value="">Select asset</option>
                    {vm.assets.map((asset: any) => (
                      <option key={asset.assetId} value={asset.assetId}>
                        {assetOptionLabel(asset)}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {line.lineKind === "ASSET_QUANTITY" ? (
                <label className="modal__field">
                  <div className="modal__label">Quantity Delta minor (int)</div>
                  <input
                    value={line.quantityDeltaMinor}
                    onChange={(e) => vm.patchCreateLine(i, { quantityDeltaMinor: e.target.value })}
                  />
                </label>
              ) : (
                <label className="modal__field">
                  <div className="modal__label">Money Delta</div>
                  <input
                    value={line.moneyDelta}
                    onChange={(e) => vm.patchCreateLine(i, { moneyDelta: e.target.value })}
                    placeholder="e.g. 12.34 or -12.34"
                  />
                </label>
              )}

              <label className="modal__field">
                <div className="modal__label">Unit Price</div>
                <input value={line.unitPrice} onChange={(e) => vm.patchCreateLine(i, { unitPrice: e.target.value })} />
              </label>

              <label className="modal__field">
                <div className="modal__label">Fee</div>
                <input
                  value={line.fee}
                  onChange={(e) => vm.patchCreateLine(i, { fee: e.target.value })}
                  placeholder="e.g. 1.25"
                />
              </label>

              <label className="modal__field">
                <div className="modal__label">Notes</div>
                <textarea value={line.notes} onChange={(e) => vm.patchCreateLine(i, { notes: e.target.value })} />
              </label>
            </div>
          ))}
        </div>

        <div className="modal__footer">
          <Button variant="ghost" onClick={vm.cancelCreate} disabled={vm.busy}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={vm.confirmCreate}
            disabled={vm.busy || vm.eventTypes.length === 0}
          >
            {vm.busy ? "Saving..." : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}
