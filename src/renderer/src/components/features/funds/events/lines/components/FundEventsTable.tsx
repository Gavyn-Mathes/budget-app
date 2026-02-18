// src/renderer/src/components/features/funds/events/lines/components/FundEventsTable.tsx
import React from "react";
import { Button } from "../../../../../../components/ui/Button";
import { formatMoney } from "../../../../../../components/utils/formatMoney";
import { useFundEventsLinesPage } from "../hooks/useFundEventsLinesPage";

export function FundEventsTable({ vm }: { vm: ReturnType<typeof useFundEventsLinesPage> }) {
  return (
    <div className="fundEventsLinesPage__tableWrap">
      <table className="fundEventsLinesPage__table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Memo</th>
            <th>Transfer</th>
            <th style={{ width: 240 }} />
          </tr>
        </thead>
        <tbody>
          {vm.loading ? (
            <tr>
              <td colSpan={5} className="fundEventsLinesPage__muted">
                Loading...
              </td>
            </tr>
          ) : vm.rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="fundEventsLinesPage__muted">
                No events found in this range.
              </td>
            </tr>
          ) : (
            vm.rows.map((r) => (
              <tr key={r.eventId}>
                <td>{r.eventDate}</td>
                <td>{vm.eventTypeNameById.get(r.eventTypeId) ?? r.eventTypeId}</td>
                <td className="fundEventsLinesPage__memo">{r.memo ?? ""}</td>
                <td className="fundEventsLinesPage__transfer">
                  {(() => {
                    const summary = vm.transferSummaryByEventId[r.eventId];
                    if (vm.transferSummaryLoading && summary === undefined) return "...";
                    if (!summary) return "--";
                    const fromName =
                      vm.assetNameById.get(summary.fromAssetId) ?? summary.fromAssetId;
                    const toName = vm.assetNameById.get(summary.toAssetId) ?? summary.toAssetId;
                    return `${formatMoney(summary.amountMinor)} ${fromName} -> ${toName}`;
                  })()}
                </td>
                <td className="fundEventsLinesPage__actions">
                  <Button variant="default" onClick={() => void vm.openEdit(r.eventId)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => void vm.openDelete(r.eventId)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
