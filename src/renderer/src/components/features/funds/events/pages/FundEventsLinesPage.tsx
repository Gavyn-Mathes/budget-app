// src/renderer/src/components/features/funds/events/pages/FundEventsLinesPage.tsx
import React from "react";
import { useFundEventsLinesPage } from "../lines/hooks/useFundEventsLinesPage";
import { FundEventsLinesHeader } from "../lines/components/FundEventLinesHeader";
import { FundEventsTable } from "../lines/components/FundEventsTable";
import { CreateFundEventDialog } from "../lines/dialogs/CreateFundEventDialog";
import { EditFundEventDialog } from "../lines/dialogs/FundEventEditorDialog";
import { DeleteFundEventDialog } from "../lines/dialogs/DeleteFundEventDialog";
import { useAppNavigate } from "@/components/navigation/useAppNavigate";
import "../../../../../styles/FundEventsLinesPage.css";
import { Button } from "@/components/ui/Button";

type Props = { onNavigate?: (path: string) => void };

export default function FundEventsLinesPage({ onNavigate }: Props) {
  const go = useAppNavigate(onNavigate);
  const vm = useFundEventsLinesPage();

  return (
    <div className="fundEventsLinesPage">
      <FundEventsLinesHeader vm={vm} />

      <div className="FundsPage__actions">
        <Button variant="secondary" onClick={() => go("/funds/events")}>
          Back
          </Button>
        </div>

      <FundEventsTable vm={vm} />

      <CreateFundEventDialog vm={vm} />
      <EditFundEventDialog vm={vm} />
      <DeleteFundEventDialog vm={vm} />
    </div>
  );
}
