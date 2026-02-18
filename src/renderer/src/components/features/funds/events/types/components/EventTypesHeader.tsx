// src/renderer/src/components/features/funds/events/types/components/EventTypesHeader.tsx
import React from "react";
import { Button } from "../../../../../../components/ui/Button";
import { useEventTypesPage } from "../hooks/useEventTypesPage";

export function EventTypesHeader({ vm }: { vm: ReturnType<typeof useEventTypesPage> }) {
  return (
    <div className="eventTypesHeader">
      <div>
        <h1 className="eventTypesHeader__title">Event Types</h1>
        <div className="eventTypesHeader__subtitle">Why an event happened (Transfer, Deposit, Gift, etc.).</div>
      </div>

      <Button variant="primary" onClick={vm.openCreate}>
        New Event Type
      </Button>
    </div>
  );
}
