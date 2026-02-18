// src/renderer/src/components/features/budgets/pages/BudgetsMonthsPage.tsx
import React from "react";
import { useAppNavigate } from "../../../../components/navigation/useAppNavigate";
import { Button } from "../../../../components/ui/Button";
import { FeatureHeader } from "../../../../components/layout/FeatureHeader";
import { formatMoney } from "../../../../components/utils/formatMoney";
import { useBudgetsMonthsPage } from "../hooks/useBudgetsMonthsPage";
import { currentMonthKey } from "../../../utils/month";
import "../../../../styles/FeatureHeader.css";
import "../../../../styles/BudgetsMonthsPage.css";

type Props = { onNavigate?: (path: string) => void };

export default function BudgetsMonthsPage({ onNavigate }: Props) {
  const go = useAppNavigate(onNavigate);
  const vm = useBudgetsMonthsPage();
  const current = currentMonthKey();

  return (
    <div className="budgetsMonths">
      <FeatureHeader
        title="Budget Months"
        subtitle="Browse monthly budgets and copy plans forward."
        right={
          <div className="budgetsMonths__headerActions">
            <Button variant="secondary" onClick={() => go("/budgets")}>
              Back
            </Button>
            <Button variant="primary" onClick={() => go(`/budgets/months/${current}`)}>
              Open {current}
            </Button>
          </div>
        }
      />

      {vm.error ? <div className="budgetsMonths__error">Error: {vm.error}</div> : null}
      {vm.notice ? <div className="budgetsMonths__notice">{vm.notice}</div> : null}

      <div className="budgetsMonths__panel">
        <div className="budgetsMonths__panelHeader">
          <div className="budgetsMonths__panelTitle">All Months</div>
          <div className="budgetsMonths__panelSubtitle">
            Earliest first, latest last.
          </div>
        </div>

        {vm.loading ? (
          <div className="budgetsMonths__loading">Loading...</div>
        ) : vm.rows.length === 0 ? (
          <div className="budgetsMonths__empty">
            <div className="budgetsMonths__emptyTitle">No budget months yet</div>
            <div className="budgetsMonths__emptySubtitle">
              Create your first budget for {current}.
            </div>
            <Button variant="primary" onClick={() => go(`/budgets/months/${current}`)}>
              Create {current}
            </Button>
          </div>
        ) : (
          <div className="budgetsMonths__tableWrap">
            <table className="budgetsMonths__table">
              <thead>
                <tr>
                  <th>Budget Month</th>
                  <th>Income Month</th>
                  <th>Cap</th>
                  <th>Notes</th>
                  <th className="budgetsMonths__right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vm.rows.map((row) => {
                  const next = vm.nextMonthFor(row.budgetMonthKey);
                  const nextExists = next ? vm.monthSet.has(next) : false;
                  const isCopying = vm.copyingMonth === row.budgetMonthKey;
                  return (
                    <tr key={row.budgetId}>
                      <td>{row.budgetMonthKey}</td>
                      <td>{row.incomeMonthKey}</td>
                      <td>{formatMoney(row.cap)}</td>
                      <td className="budgetsMonths__notes">{row.notes ?? ""}</td>
                      <td className="budgetsMonths__actions">
                        <Button
                          variant="secondary"
                          onClick={() => go(`/budgets/months/${row.budgetMonthKey}`)}
                        >
                          Open
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => vm.copyToNextMonth(row.budgetMonthKey)}
                          disabled={nextExists || isCopying}
                          title={nextExists ? `Budget ${next} already exists` : undefined}
                        >
                          {isCopying ? "Copying..." : next ? `Copy -> ${next}` : "Copy"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
