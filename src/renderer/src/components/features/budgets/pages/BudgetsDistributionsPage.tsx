// src/renderer/src/components/features/budgets/pages/BudgetsDistributionsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { DistributionRule } from "../../../../../../shared/types/distribution";
import { useAppNavigate } from "../../../../components/navigation/useAppNavigate";
import { Button } from "../../../../components/ui/Button";
import { FeatureHeader } from "../../../../components/layout/FeatureHeader";
import { useDistributionsPage } from "../distributions/hooks/useDistributionsPage";
import { DistributionsTable } from "../distributions/components/DistributionsTable";
import { DistributionEditorDialog } from "../distributions/dialogs/DistributionEditorDialog";
import { currentMonthKey } from "../../../utils/month";
import "../../../../styles/FeatureHeader.css";
import "../../../../styles/BudgetsDistributionsPage.css";

type Props = { onNavigate?: (path: string) => void };

export default function BudgetsDistributionsPage({ onNavigate }: Props) {
  const go = useAppNavigate(onNavigate);
  const params = useParams();
  const vm = useDistributionsPage();
  const current = currentMonthKey();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copyFromMonthKey, setCopyFromMonthKey] = useState<string>("");

  useEffect(() => {
    const paramMonth = params.monthKey ? String(params.monthKey) : "";
    if (paramMonth && paramMonth !== vm.budgetMonthKey) {
      vm.setBudgetMonthKey(paramMonth);
    }
  }, [params.monthKey, vm.budgetMonthKey, vm.setBudgetMonthKey]);

  useEffect(() => {
    setCopyFromMonthKey("");
  }, [vm.budgetMonthKey]);

  const editing: DistributionRule | null = useMemo(() => {
    if (!editingId) return null;
    return vm.rules.find((r) => r.distributionRuleId === editingId) ?? null;
  }, [editingId, vm.rules]);

  const categoryNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of vm.categories) m.set(c.categoryId, c.name);
    return m;
  }, [vm.categories]);

  const fundNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const f of vm.funds) m.set(f.fundId, f.name ?? f.fundId);
    return m;
  }, [vm.funds]);

  const assetNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of vm.assets) m.set(a.assetId, a.name ?? a.assetId);
    return m;
  }, [vm.assets]);

  const copyOptions = useMemo(() => {
    return vm.budgets.filter((b) => b.budgetMonthKey !== vm.budgetMonthKey);
  }, [vm.budgets, vm.budgetMonthKey]);

  const monthSelectValue = useMemo(() => {
    return vm.budgets.some((b) => b.budgetMonthKey === vm.budgetMonthKey)
      ? vm.budgetMonthKey
      : "";
  }, [vm.budgets, vm.budgetMonthKey]);

  return (
    <div className="budgetsDist">
      <FeatureHeader
        title="Distributions"
        subtitle="Create and manage budget distribution rules."
        right={
          <div className="budgetsDist__headerActions">
            <Button variant="secondary" onClick={() => go("/budgets")}>
              Back
            </Button>
            <Button
              variant="ghost"
              onClick={() => go(`/budgets/months/${vm.budgetMonthKey || current}`)}
              disabled={!vm.budgetMonthKey}
            >
              Open {vm.budgetMonthKey || current}
            </Button>
          </div>
        }
      />

      {vm.error ? <div className="budgetsDist__error">Error: {vm.error}</div> : null}
      {vm.metaError ? <div className="budgetsDist__error">Meta: {vm.metaError}</div> : null}
      {vm.notice ? <div className="budgetsDist__notice">{vm.notice}</div> : null}

      <div className="budgetsDist__panel">
        <div className="budgetsDist__panelHeader">
          <div className="budgetsDist__panelTitle">Budget Month</div>
          <div className="budgetsDist__panelSubtitle">Pick a month to manage its rules.</div>
        </div>

        <div className="budgetsDist__filters">
          <label className="budgetsDist__field">
            <div className="budgetsDist__label">Budget month</div>
            <select
              className="budgetsDist__input"
              value={monthSelectValue}
              onChange={(e) => vm.setBudgetMonthKey(e.target.value)}
            >
              {vm.budgets.length === 0 ? <option value="">No budgets</option> : null}
              {vm.budgets.map((b) => (
                <option key={b.budgetId} value={b.budgetMonthKey}>
                  {b.budgetMonthKey}
                </option>
              ))}
            </select>
          </label>
          <Button
            variant="ghost"
            disabled={!vm.budget}
            onClick={() => go(`/budgets/months/${vm.budget?.budgetMonthKey}`)}
          >
            Open Budget
          </Button>
        </div>

        {vm.metaLoading ? <div className="budgetsDist__loading">Loading data...</div> : null}
      </div>

      <div className="budgetsDist__panel">
        <div className="budgetsDist__panelHeader">
          <div className="budgetsDist__panelTitle">Rules</div>
          <div className="budgetsDist__panelSubtitle">
            Define how surplus or category leftovers move into funds.
          </div>
        </div>

        {!vm.budget ? (
          <div className="budgetsDist__empty">
            <div className="budgetsDist__emptyTitle">No budget found for this month</div>
            <div className="budgetsDist__emptySubtitle">
              Create a budget first, then add distribution rules.
            </div>
            <Button variant="primary" onClick={() => go(`/budgets/months/${vm.budgetMonthKey}`)}>
              Create Budget
            </Button>
          </div>
        ) : (
          <>
            <div className="budgetsDist__summary">
              <div>
                <div className="budgetsDist__summaryLabel">Rules</div>
                <div className="budgetsDist__summaryValue">{vm.rules.length}</div>
              </div>
              <div>
                <div className="budgetsDist__summaryLabel">Budget</div>
                <div className="budgetsDist__summaryValue">{vm.budget.budgetMonthKey}</div>
              </div>
            </div>

            <div className="budgetsDist__actions">
              <Button
                variant="primary"
                onClick={() => {
                  setEditingId(null);
                  setDialogOpen(true);
                }}
                disabled={vm.metaLoading}
              >
                Add Rule
              </Button>

              {copyOptions.length > 0 ? (
                <div className="budgetsDist__copyGroup">
                  <label className="budgetsDist__label">
                    Copy rules from
                    <select
                      className="budgetsDist__input"
                      value={copyFromMonthKey}
                      onChange={(e) => setCopyFromMonthKey(e.target.value)}
                    >
                      <option value="">Select month</option>
                      {copyOptions.map((b) => (
                        <option key={b.budgetId} value={b.budgetMonthKey}>
                          {b.budgetMonthKey}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button
                    variant="ghost"
                    disabled={!copyFromMonthKey || vm.copyBusy}
                    onClick={() => vm.copyFromMonth(copyFromMonthKey)}
                  >
                    {vm.copyBusy ? "Copying..." : "Copy"}
                  </Button>
                </div>
              ) : null}
            </div>

            {vm.loading ? (
              <div className="budgetsDist__loading">Loading...</div>
            ) : vm.rules.length === 0 ? (
              <div className="budgetsDist__empty">
                <div className="budgetsDist__emptyTitle">No rules yet</div>
                <div className="budgetsDist__emptySubtitle">
                  Add a rule to route surplus or leftover category balances.
                </div>
                <Button
                  variant="primary"
                  onClick={() => {
                    setEditingId(null);
                    setDialogOpen(true);
                  }}
                >
                  Create Rule
                </Button>
              </div>
            ) : (
              <div className="budgetsDist__tableWrap">
                <DistributionsTable
                  rows={vm.rules}
                  categoryNameById={categoryNameById}
                  fundNameById={fundNameById}
                  assetNameById={assetNameById}
                  onEdit={(id) => {
                    setEditingId(id);
                    setDialogOpen(true);
                  }}
                  onDelete={(id) => vm.deleteRule(id)}
                />
              </div>
            )}
          </>
        )}
      </div>

      <DistributionEditorDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setEditingId(null);
        }}
        budgetId={vm.budget?.budgetId ?? null}
        categories={vm.categories}
        funds={vm.funds}
        cashAssetsByFund={vm.cashAssetsByFund}
        editing={editing}
        onSave={(input) => vm.upsertRule(input)}
      />
    </div>
  );
}
