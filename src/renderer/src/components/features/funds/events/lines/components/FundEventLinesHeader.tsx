// src/renderer/src/components/features/funds/events/lines/components/FundEventsLinesHeader.tsx
import React from "react";
import { Button } from "../../../../../../components/ui/Button";
import { useFundEventsLinesPage } from "../hooks/useFundEventsLinesPage";

export function FundEventsLinesHeader({ vm }: { vm: ReturnType<typeof useFundEventsLinesPage> }) {
  return (
    <div className="fundEventsLinesPage__header">
      <div>
        <h1 className="fundEventsLinesPage__title">Fund Events</h1>
        <div className="fundEventsLinesPage__subtitle">
          Create/Edit/Delete events. Lines are managed through the parent event.
        </div>
      </div>

      <Button variant="primary" onClick={vm.openCreate}>
        Create Event
      </Button>
    </div>
  );
}
