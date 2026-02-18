// renderer/src/pages/BudgetsHome.tsx
import React, { useMemo } from "react";
import { monthKeyFromDate } from "../../../../../../shared/domain/month";
import { useAppNavigate } from "../../../navigation/useAppNavigate";
import { Button } from "../../../ui/Button";
import { TileButton } from "../../../ui/TileButton";
import { FeatureHeader } from "../../../layout/FeatureHeader";
import { TileGrid } from "../../../layout/TileGrid";
import "../../../../styles/BudgetsHomePage.css";
import "../../../../styles/FeatureHeader.css";
import "../../../../styles/TileGrid.css";

type Props = { onNavigate?: (path: string) => void };

export default function BudgetsHomePage({ onNavigate }: Props) {
  const currentMonth = useMemo(() => monthKeyFromDate(), []);
  const go = useAppNavigate(onNavigate);

  return (
    <div className="budgetsHome">
      <FeatureHeader
        title="Budgets"
        subtitle="Plan months, manage income, and tune categories."
        right={
          <Button variant="primary" onClick={() => go(`/budgets/months/${currentMonth}`)}>
            Open {currentMonth}
          </Button>
        }
      />

      <TileGrid>
        <TileButton
          title="This Month"
          subtitle={`Plan ${currentMonth}`}
          onClick={() => go(`/budgets/months/${currentMonth}`)}
        />

        <TileButton
          title="All Months"
          subtitle="Browse & copy plans"
          onClick={() => go("/budgets/months")}
        />

        <TileButton
          title="Income"
          subtitle="Create & manage incomes"
          onClick={() => go("/budgets/incomes")}
        />

        <TileButton
          title="Categories"
          subtitle="Edit categories & defaults"
          onClick={() => go("/budgets/categories")}
        />

        <TileButton
          title="Transactions"
          subtitle="Track expenses"
          onClick={() => go("/budgets/transactions")}
        />

        <TileButton
          title="Distributions"
          subtitle="Route surplus & leftovers"
          onClick={() => go(`/budgets/distributions/${currentMonth}`)}
        />
      </TileGrid>
    </div>
  );
}
