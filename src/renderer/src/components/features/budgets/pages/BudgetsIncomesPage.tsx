// src/renderer/src/components/features/budgets/pages/BudgetsIncomePage.tsx
import React, { useMemo, useState } from "react";
import type { Income } from "../../../../../../shared/types/income";
import { useAppNavigate } from "../../../../components/navigation/useAppNavigate";
import { FeatureHeader } from "../../../../components/layout/FeatureHeader";
import { Button } from "../../../../components/ui/Button";
import { formatMoney } from "@/components/utils/formatMoney";
import { IncomeEditorDialog } from "../incomes/dialogs/IncomesEditorDialog";
import { IncomesTable } from "../incomes/components/IncomesTable";
import { useIncomesPage } from "../incomes/hooks/useIncomesPage";
import "../../../../styles/BudgetsIncomesPage.css";
import "../../../../styles/FeatureHeader.css";

type Props = { onNavigate?: (path: string) => void };

export default function BudgetsIncomePage({ onNavigate }: Props) {
  const go = useAppNavigate(onNavigate);

  const {
    incomeMonthKey,
    setIncomeMonthKey,
    incomes,
    incomeMonth,
    funds,
    cashAssetsByFund,
    total,
    loading,
    metaLoading,
    error,
    metaError,
    setPostingTarget,
    upsert,
    remove,
  } = useIncomesPage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editing: Income | null = useMemo(() => {
    if (!editingId) return null;
    return incomes.find((x) => x.incomeId === editingId) ?? null;
  }, [editingId, incomes]);

  return (
    <div className="budgetsIncome">
      <FeatureHeader
        title="Income"
        subtitle="Create and manage income entries by month."
        right={
          <div className="budgetsIncome__headerActions">
            <Button variant="secondary" onClick={() => go("/budgets")}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setEditingId(null);
                setDialogOpen(true);
              }}
            >
              Add Income
            </Button>
          </div>
        }
      />

      <div className="budgetsIncome__summaryRow">
        <div className="budgetsIncome__monthPicker">
          <div className="budgetsIncome__fieldLabel">Income month (YYYY-MM)</div>
          <input
            className="budgetsIncome__monthInput"
            value={incomeMonthKey}
            onChange={(e) => setIncomeMonthKey(e.target.value)}
            placeholder="2026-02"
          />
        </div>

        <div className="budgetsIncome__monthPicker">
          <div className="budgetsIncome__fieldLabel">Posting Fund</div>
          <select
            className="budgetsIncome__monthInput"
            value={String(incomeMonth?.incomeFundId ?? "")}
            onChange={(e) =>
              setPostingTarget({
                incomeFundId: e.target.value ? e.target.value : null,
                incomeAssetId: null,
              })
            }
            disabled={loading || metaLoading}
          >
            <option value="">None</option>
            {funds.map((f: any) => (
              <option key={String(f.fundId)} value={String(f.fundId)}>
                {String(f.name ?? f.fundId)}
              </option>
            ))}
          </select>
        </div>

        <div className="budgetsIncome__monthPicker">
          <div className="budgetsIncome__fieldLabel">Posting Asset</div>
          <select
            className="budgetsIncome__monthInput"
            value={String(incomeMonth?.incomeAssetId ?? "")}
            onChange={(e) =>
              setPostingTarget({
                incomeAssetId: e.target.value ? e.target.value : null,
              })
            }
            disabled={loading || metaLoading || !String(incomeMonth?.incomeFundId ?? "").trim()}
          >
            <option value="">Auto (single cash asset)</option>
            {(cashAssetsByFund.get(String(incomeMonth?.incomeFundId ?? "")) ?? []).map((a: any) => (
              <option key={String(a.assetId)} value={String(a.assetId)}>
                {String(a.name ?? a.assetId)}
              </option>
            ))}
          </select>
        </div>

        <div className="budgetsIncome__summaryCard">
          <div className="budgetsIncome__summaryLabel">Total (month)</div>
          <div className="budgetsIncome__summaryValue">{formatMoney(total)}</div>
          <div className="budgetsIncome__summaryHint">Sum of all entries in this month.</div>
        </div>
      </div>

      <div className="budgetsIncome__panel">
        <div className="budgetsIncome__panelHeader">
          <div className="budgetsIncome__panelTitle">Entries</div>
          <div className="budgetsIncome__panelSubtitle">Add paychecks, stipends, refunds, etc.</div>
        </div>

        {error ? <div className="budgetsIncome__error">{error}</div> : null}
        {metaError ? <div className="budgetsIncome__error">Meta: {metaError}</div> : null}
        {loading ? <div className="budgetsIncome__loading">Loading...</div> : null}

        {!loading && incomes.length === 0 ? (
          <div className="budgetsIncome__empty">
            <div className="budgetsIncome__emptyTitle">No income entries</div>
            <div className="budgetsIncome__emptySubtitle">
              Add your first income entry for {incomeMonthKey}.
            </div>
            <Button
              variant="primary"
              onClick={() => {
                setEditingId(null);
                setDialogOpen(true);
              }}
            >
              Create Income
            </Button>
          </div>
        ) : null}

        {!loading && incomes.length > 0 ? (
          <IncomesTable
            incomes={incomes}
            onEdit={(id) => {
              setEditingId(id);
              setDialogOpen(true);
            }}
            onDelete={(id) => remove(id)}
          />
        ) : null}
      </div>

      <IncomeEditorDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setEditingId(null);
        }}
        incomeMonthKey={incomeMonthKey}
        editing={editing}
        onSave={(input) => upsert(input)}
      />
    </div>
  );
}
