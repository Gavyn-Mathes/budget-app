// src/renderer/src/components/features/funds/events/pages/EventTypesPage.tsx
import React from "react";
import { useEventTypesPage } from "../types/hooks/useEventTypesPage";
import { EventTypesHeader } from "../types/components/EventTypesHeader";
import { EventTypesTable } from "../types/components/EventTypesTable";
import { EventTypeEditorDialog } from "../types/dialogs/EventTypesEditorDialog";
import { DeleteEventTypeDialog } from "../types/dialogs/DeleteEventTypesDialog";
import { Button } from "@/components/ui/Button";
import { useAppNavigate } from "@/components/navigation/useAppNavigate";
import "../../../../../styles/EventTypesPage.css";

type Props = { onNavigate?: (path: string) => void };

export default function EventTypesPage({ onNavigate }: Props) {
  const go = useAppNavigate(onNavigate);
  const vm = useEventTypesPage();

  return (
    <div className="eventTypesPage">
      <EventTypesHeader vm={vm} />
      <div className="FundsPage__actions">
              <Button variant="secondary" onClick={() => go("/funds/events")}>
                Back
                </Button>
              </div>
      <EventTypesTable vm={vm} />

      <EventTypeEditorDialog vm={vm} />
      <DeleteEventTypeDialog vm={vm} />
    </div>
  );
}
