// src/renderer/src/pages/FundsHomePage.tsx
import React from "react";
import { useAppNavigate } from "@/components/navigation/useAppNavigate";
import { Button } from "@/components/ui/Button";
import { TileButton } from "@/components/ui/TileButton";
import "@/styles/FundsHomePage.css";

type Props = { onNavigate?: (path: string) => void };

export default function FundsHomePage({ onNavigate }: Props) {
  const go = useAppNavigate(onNavigate);

  return (
    <div className="fundsHome">
      <div className="fundsHome__header">
        <div>
          <h1 className="fundsHome__title">Funds</h1>
          <div className="fundsHome__subtitle">
            Manage funds, allocations, and history-driven changes.
          </div>
        </div>

        <Button variant="primary" onClick={() => go("/funds/list")}>
          Open Funds
        </Button>
      </div>

      <div className="fundsHome__grid">
        <TileButton
          title="Funds"
          subtitle="Create & manage funds"
          onClick={() => go("/funds/list")}
        />

        <TileButton
          title="Events"
          subtitle={`Transfer, spend, or ledger`}
          onClick={() => go(`/funds/events`)}
        />

        <TileButton
          title="Assets"
          subtitle="Track fund assets & balances"
          onClick={() => go("/funds/assets")}
        />

        <TileButton
          title="Liabilities"
          subtitle="Track debts tied to funds"
          onClick={() => go("/funds/liabilities")}
        />
      </div>
    </div>
  );
}
