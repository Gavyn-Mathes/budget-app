// src/renderer/src/components/features/funds/events/types/components/EventTypesTable.tsx
import React from "react";
import { Button } from "../../../../../../components/ui/Button";
import { useEventTypesPage } from "../hooks/useEventTypesPage";

export function EventTypesTable({ vm }: { vm: ReturnType<typeof useEventTypesPage> }) {
  if (vm.loading) return <div className="eventTypesTable__state">Loading…</div>;
  if (vm.error) return <div className="eventTypesTable__state eventTypesTable__state--error">Error: {vm.error}</div>;

  if (!vm.rows.length) {
    return <div className="eventTypesTable__state">No event types yet. Create your first preset.</div>;
  }

  return (
    <div className="eventTypesTable">
      <table className="eventTypesTable__table">
        <thead>
          <tr>
            <th>Name</th>
            <th className="eventTypesTable__colActions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vm.rows.map((r) => (
            <tr key={r.eventTypeId}>
              <td>{r.eventType}</td>
              <td className="eventTypesTable__actions">
                <Button variant="ghost" onClick={() => vm.openEdit(r)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => vm.requestDelete(r)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
