// src/renderer/src/components/features/funds/events/pages/FundEventsHomePage.tsx
import React from "react";
import { useAppNavigate } from "../../../../../components/navigation/useAppNavigate";
import { Button } from "../../../../../components/ui/Button";
import { TileButton } from "../../../../../components/ui/TileButton";
import "../../../../../styles/FundEventsHomePage.css";

type Props = { onNavigate?: (path: string) => void };

export default function FundsEventsHomePage({ onNavigate }: Props) {
  const go = useAppNavigate(onNavigate);

  return (
    <div className="fundEventsHome">
      <div className="fundEventsHome__header">
        <div>
          <h1 className="fundEventsHome__title">Fund Events</h1>
          <div className="fundEventsHome__subtitle">
            Track balances, record spending, and transfer value between funds using ledger lines.
          </div>
          <div className="fundsEventsPage__actions">
            <Button variant="secondary" onClick={() => go("/funds")}>
              Back
              </Button>
          </div>
        </div>

        <Button variant="primary" onClick={() => go("/funds/events/lines")}>
          Create Event
        </Button>
      </div>

      <div className="fundEventsHome__grid">
        <TileButton
          title="See Events"
          subtitle="View & create FundEventLines"
          onClick={() => go("/funds/events/lines")}
        />

        <TileButton
          title="Event Types"
          subtitle="Manage EventType presets"
          onClick={() => go("/funds/events/types")}
        />

        <TileButton
          title="New Transfer"
          subtitle="Move value between funds (coming soon)"
          onClick={() => go("/funds/events/transfer")}
        />

        <TileButton
          title="Spending"
          subtitle="Record spending from a fund (coming soon)"
          onClick={() => go("/funds/events/spend")}
        />
      </div>
    </div>
  );
}
