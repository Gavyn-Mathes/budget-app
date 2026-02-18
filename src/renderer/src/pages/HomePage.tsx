import React, { useMemo } from "react";
import { monthKeyFromDate } from "../../../shared/domain/month";
import { useAppNavigate } from "../components/navigation/useAppNavigate";
import { Button } from "../components/ui/Button";
import { TileButton } from "../components/ui/TileButton";
import "../styles/HomePage.css";

type Props = {
  onNavigate?: (path: string) => void;
};

export default function HomePage({ onNavigate }: Props) {
  const currentMonth = useMemo(() => monthKeyFromDate(), []);
  const go = useAppNavigate(onNavigate);

  return (
    <div className="home">
      <div className="home__header">
        <div>
          <h1 className="home__title">Home</h1>
          <div className="home__subtitle">Quick access to your core pages.</div>
        </div>

        <Button variant="primary" onClick={() => go(`/budgets/months/${currentMonth}`)}>
          Open {currentMonth} Budget
        </Button>
      </div>

      <div className="home__grid">
        <TileButton
          title="Budget"
          subtitle={`Plan ${currentMonth}`}
          onClick={() => go("/budgets")}
        />

        <TileButton
          title="Funds"
          subtitle="Manage funds & allocations"
          onClick={() => go("/funds")}
        />

        <TileButton
          title="Accounts"
          subtitle="Manage physical liabilities and assets"
          onClick={() => go("/accounts")}
        />
      </div>
    </div>
  );
}
