// src/renderer/src/components/features/budgets/pages/BudgetsMonthPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { BudgetLine } from "../../../../../../shared/types/budget_line";
import { computeBudgetAllocationPlan } from "../../../../../../shared/domain/budget_line";
import { useAppNavigate } from "../../../../components/navigation/useAppNavigate";
import { Button } from "../../../../components/ui/Button";
import {
  formatMoney,
  moneyInputBlurValue,
  moneyInputFocusValue,
  parseMoney,
  toMoneyInputString,
} from "../../../../components/utils/formatMoney";
import { FeatureHeader } from "../../../../components/layout/FeatureHeader";
import { useBudgetMonthPage } from "../hooks/useBudgetMonthPage";
import { BudgetLinesTable } from "../lines/components/BudgetLinesTable";
import { BudgetLineEditorDialog } from "../lines/dialogs/BudgetLineEditorDialog";
import { DistributionsTable } from "../distributions/components/DistributionsTable";
import { currentMonthKey } from "../../../utils/month";
import "../../../../styles/FeatureHeader.css";
import "../../../../styles/BudgetsMonthPage.css";
import "../../../../styles/BudgetsDistributionsPage.css";

type Props = { onNavigate?: (path: string) => void };

export default function BudgetsMonthPage({ onNavigate }: Props) {
  const go = useAppNavigate(onNavigate);
  const vm = useBudgetMonthPage();
  const params = useParams();
  const current = currentMonthKey();
  const [lineDialogOpen, setLineDialogOpen] = useState(false);
  const [editingLineCategoryId, setEditingLineCategoryId] = useState<string | null>(null);
  const [editorCapInput, setEditorCapInput] = useState<string>("0.00");

  const fundNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const f of vm.funds) m.set(String((f as any).fundId), String((f as any).name ?? ""));
    return m;
  }, [vm.funds]);

  const categoryNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of vm.categories ?? []) {
      m.set(String(c.categoryId), String(c.name ?? ""));
    }
    return m;
  }, [vm.categories]);

  const budgetLinesSorted = useMemo(() => {
    return [...vm.budgetLines].sort((a, b) => {
      const an = categoryNameById.get(a.categoryId) ?? a.categoryId;
      const bn = categoryNameById.get(b.categoryId) ?? b.categoryId;
      return an.localeCompare(bn, undefined, { sensitivity: "base" });
    });
  }, [vm.budgetLines, categoryNameById]);

  const allocationPlan = useMemo(() => {
    if (!vm.row) return null;
    return computeBudgetAllocationPlan(
      vm.budgetLines,
      Number(vm.incomeMonthTotalMinor ?? 0),
      Number(vm.row.cap ?? 0)
    );
  }, [vm.row, vm.budgetLines, vm.incomeMonthTotalMinor]);

  const remainingByCategory = useMemo(() => {
    const map = new Map<string, number>();
    if (!allocationPlan) return map;

    for (const line of vm.budgetLines) {
      const planned = allocationPlan.plannedByCategory.get(line.categoryId) ?? 0;
      const spent = vm.spentByCategory[line.categoryId] ?? 0;
      map.set(line.categoryId, planned - spent);
    }
    return map;
  }, [allocationPlan, vm.budgetLines, vm.spentByCategory]);

  const surplusPoolMinor = useMemo(() => {
    if (!allocationPlan) return 0;
    const income = Number(vm.incomeMonthTotalMinor ?? 0);
    return Math.max(0, income - Number(allocationPlan.spendablePoolMinor ?? 0));
  }, [allocationPlan, vm.incomeMonthTotalMinor]);

  const editorCapValid = useMemo(() => {
    if (!vm.editorOpen) return true;
    const raw = editorCapInput.trim();
    if (!raw) return true;
    try {
      const capMinor = parseMoney(raw);
      return Number.isInteger(capMinor) && capMinor >= 0;
    } catch {
      return false;
    }
  }, [vm.editorOpen, editorCapInput]);

  const editingBudgetLine: BudgetLine | null = useMemo(() => {
    if (!editingLineCategoryId) return null;
    return vm.budgetLines.find((line) => line.categoryId === editingLineCategoryId) ?? null;
  }, [editingLineCategoryId, vm.budgetLines]);

  const allCashAssets = useMemo(() => {
    const list: any[] = [];
    for (const assets of vm.cashAssetsByFund.values()) list.push(...assets);
    return list;
  }, [vm.cashAssetsByFund]);

  const assetNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of allCashAssets) {
      m.set(String((a as any).assetId), String((a as any).name ?? ""));
    }
    return m;
  }, [allCashAssets]);

  useEffect(() => {
    const paramMonth = params.monthKey ? String(params.monthKey) : "";
    if (paramMonth && paramMonth !== vm.monthKey) {
      vm.setMonthKey(paramMonth);
    }
  }, [params.monthKey, vm.monthKey, vm.setMonthKey]);

  useEffect(() => {
    setLineDialogOpen(false);
    setEditingLineCategoryId(null);
  }, [vm.row?.budgetId]);

  useEffect(() => {
    if (!vm.editorOpen || !vm.editor) return;
    setEditorCapInput(toMoneyInputString((vm.editor as any).cap ?? 0));
  }, [vm.editorOpen, vm.editor?.budgetId, vm.editor?.budgetMonthKey]);

  return (
    <div className="budgetMonth">
      <FeatureHeader
        title={`Budget ${vm.monthKey}`}
        subtitle="View or edit your monthly budget."
        right={
          <div className="budgetMonth__headerActions">
            <Button variant="secondary" onClick={() => go("/budgets/months")}>
              Back
            </Button>
            <Button variant="ghost" onClick={() => vm.setMonthKey(current)}>
              Jump to {current}
            </Button>
          </div>
        }
      />

      {vm.error ? <div className="budgetMonth__error">Error: {vm.error}</div> : null}
      {vm.distError ? <div className="budgetMonth__error">Distribution: {vm.distError}</div> : null}
      {vm.distNotice ? <div className="budgetMonth__notice">{vm.distNotice}</div> : null}
      {vm.budgetLinesError ? (
        <div className="budgetMonth__error">Category allocations: {vm.budgetLinesError}</div>
      ) : null}
      {vm.budgetLinesNotice ? <div className="budgetMonth__notice">{vm.budgetLinesNotice}</div> : null}
      {vm.distRulesError ? (
        <div className="budgetMonth__error">Distribution rules: {vm.distRulesError}</div>
      ) : null}
      {vm.metaError ? <div className="budgetMonth__error">Meta: {vm.metaError}</div> : null}

      <div className="budgetMonth__panel">
        <div className="budgetMonth__panelHeader">
          <div className="budgetMonth__panelTitle">Month</div>
          <div className="budgetMonth__panelSubtitle">Set the month to view or edit.</div>
        </div>

        <div className="budgetMonth__filters">
          <label className="budgetMonth__field">
            <div className="budgetMonth__label">Budget month (YYYY-MM)</div>
            <input
              className="budgetMonth__input"
              value={vm.monthKey}
              onChange={(e) => vm.setMonthKey(e.target.value)}
              placeholder="2026-02"
            />
          </label>
          <Button variant="ghost" onClick={() => vm.refresh(vm.monthKey)}>
            Refresh
          </Button>
        </div>

        {vm.loading ? (
          <div className="budgetMonth__loading">Loading...</div>
        ) : !vm.row ? (
          <div className="budgetMonth__empty">
            <div className="budgetMonth__emptyTitle">No budget for {vm.monthKey}</div>
            <div className="budgetMonth__emptySubtitle">Create one to start planning.</div>
            <Button variant="primary" onClick={vm.openCreateOrEdit}>
              Create Budget
            </Button>
          </div>
        ) : (
          <div className="budgetMonth__summary">
            <div>
              <div className="budgetMonth__summaryLabel">Income Month</div>
              <div className="budgetMonth__summaryValue">{vm.row.incomeMonthKey}</div>
            </div>
            <div>
              <div className="budgetMonth__summaryLabel">Cap</div>
              <div className="budgetMonth__summaryValue">{formatMoney(vm.row.cap)}</div>
            </div>
            <div>
              <div className="budgetMonth__summaryLabel">Surplus Handled</div>
              <div className="budgetMonth__summaryValue">{vm.row.surplusHandled ? "Yes" : "No"}</div>
            </div>
            <div>
              <div className="budgetMonth__summaryLabel">Leftovers Handled</div>
              <div className="budgetMonth__summaryValue">{vm.row.leftoversHandled ? "Yes" : "No"}</div>
            </div>
            <div>
              <div className="budgetMonth__summaryLabel">Spending Fund</div>
              <div className="budgetMonth__summaryValue">
                {vm.row.spendingFundId
                  ? fundNameById.get(vm.row.spendingFundId) ?? vm.row.spendingFundId
                  : "-"}
              </div>
            </div>
            <div>
              <div className="budgetMonth__summaryLabel">Spending Asset</div>
              <div className="budgetMonth__summaryValue">
                {vm.row.spendingAssetId
                  ? allCashAssets.find((a) => String((a as any).assetId) === String(vm.row!.spendingAssetId))
                      ? String(
                          (allCashAssets.find((a) => String((a as any).assetId) === String(vm.row!.spendingAssetId)) as any)
                            .name ?? vm.row.spendingAssetId
                        )
                      : vm.row.spendingAssetId
                  : "-"}
              </div>
            </div>
            <div>
              <div className="budgetMonth__summaryLabel">Overage Fund</div>
              <div className="budgetMonth__summaryValue">
                {vm.row.overageFundId ? fundNameById.get(vm.row.overageFundId) ?? vm.row.overageFundId : "-"}
              </div>
            </div>
            <div>
              <div className="budgetMonth__summaryLabel">Overage Asset</div>
              <div className="budgetMonth__summaryValue">
                {vm.row.overageAssetId
                  ? allCashAssets.find((a) => String((a as any).assetId) === String(vm.row!.overageAssetId))
                      ? String(
                          (allCashAssets.find((a) => String((a as any).assetId) === String(vm.row!.overageAssetId)) as any)
                            .name ?? vm.row.overageAssetId
                        )
                      : vm.row.overageAssetId
                  : "-"}
              </div>
            </div>
            <div>
              <div className="budgetMonth__summaryLabel">Notes</div>
              <div className="budgetMonth__summaryValue">{vm.row.notes ?? "-"}</div>
            </div>
            <Button variant="secondary" onClick={vm.openCreateOrEdit}>
              Edit Budget
            </Button>
          </div>
        )}
      </div>

      {vm.row ? (
        <div className="budgetMonth__panel">
          <div className="budgetMonth__panelHeader">
            <div className="budgetMonth__panelTitle">Category Allocations</div>
            <div className="budgetMonth__panelSubtitle">
              Set a fixed amount or a percent target for each category.
            </div>
          </div>

          <div className="budgetMonth__summary">
            <div>
              <div className="budgetMonth__summaryLabel">Allocated Categories</div>
              <div className="budgetMonth__summaryValue">{budgetLinesSorted.length}</div>
            </div>
            <div>
              <div className="budgetMonth__summaryLabel">Available Categories</div>
              <div className="budgetMonth__summaryValue">{vm.categories.length}</div>
            </div>
            <div>
              <div className="budgetMonth__summaryLabel">Left to Allocate</div>
              <div className="budgetMonth__summaryValue">
                {allocationPlan ? formatMoney(allocationPlan.remainingMinor) : "--"}
              </div>
            </div>
          </div>

          <div className="budgetMonth__distActions">
            <Button
              variant="primary"
              disabled={
                vm.budgetLinesLoading ||
                vm.categories.length === 0 ||
                budgetLinesSorted.length >= vm.categories.length
              }
              onClick={() => {
                setEditingLineCategoryId(null);
                setLineDialogOpen(true);
              }}
            >
              Add Category Allocation
            </Button>
            <Button
              variant="ghost"
              disabled={vm.budgetLinesLoading}
              onClick={() => vm.refreshBudgetLines(vm.row?.budgetId)}
            >
              Refresh Allocations
            </Button>
          </div>

          {vm.budgetLinesLoading ? (
            <div className="budgetMonth__loading">Loading category allocations...</div>
          ) : budgetLinesSorted.length === 0 ? (
            <div className="budgetMonth__empty">
              <div className="budgetMonth__emptyTitle">No category allocations yet</div>
              <div className="budgetMonth__emptySubtitle">
                Add a category line to define your monthly target by fixed value or percent.
              </div>
              <Button
                variant="primary"
                disabled={vm.categories.length === 0}
                onClick={() => {
                  setEditingLineCategoryId(null);
                  setLineDialogOpen(true);
                }}
              >
                Create Allocation
              </Button>
            </div>
          ) : (
            <div className="budgetMonth__rules">
              <BudgetLinesTable
                rows={budgetLinesSorted}
                categoryNameById={categoryNameById}
                spendablePoolMinor={allocationPlan?.spendablePoolMinor ?? null}
                percentBaseMinor={allocationPlan?.percentBaseMinor ?? null}
                remainingByCategory={remainingByCategory}
                onEdit={(categoryId) => {
                  setEditingLineCategoryId(categoryId);
                  setLineDialogOpen(true);
                }}
                onDelete={(categoryId) => vm.deleteBudgetLine(categoryId)}
              />
            </div>
          )}
        </div>
      ) : null}

      {vm.row ? (
        <div className="budgetMonth__panel">
          <div className="budgetMonth__panelHeader">
            <div className="budgetMonth__panelTitle">Distributions</div>
            <div className="budgetMonth__panelSubtitle">Apply surplus and leftovers to funds.</div>
          </div>

          {vm.distRulesLoading ? (
            <div className="budgetMonth__loading">Checking distribution rules...</div>
          ) : vm.distRulesCount === 0 ? (
            <div className="budgetMonth__notice">
              No distribution rules for this budget yet. Add at least one rule to direct surplus or
              leftovers.
            </div>
          ) : null}

          <div className="budgetMonth__summary">
            <div>
              <div className="budgetMonth__summaryLabel">Run Mode</div>
              <div className="budgetMonth__summaryValue">Manual</div>
            </div>
            <div>
              <div className="budgetMonth__summaryLabel">Surplus Pool</div>
              <div className="budgetMonth__summaryValue">
                {formatMoney(surplusPoolMinor)}
              </div>
            </div>
            <div>
              <div className="budgetMonth__summaryLabel">Surplus</div>
              <div className="budgetMonth__summaryValue">
                {surplusPoolMinor > 0 ? (vm.row.surplusHandled ? "Handled" : "Pending") : "None"}
              </div>
            </div>
            <div>
              <div className="budgetMonth__summaryLabel">Leftovers</div>
              <div className="budgetMonth__summaryValue">{vm.row.leftoversHandled ? "Handled" : "Pending"}</div>
            </div>
          </div>

          <div className="budgetMonth__distActions">
            <Button
              variant="primary"
              disabled={vm.distBusy}
              onClick={() =>
                vm.applyDistributions(
                  "ALL",
                  !!(vm.row?.surplusHandled || vm.row?.leftoversHandled)
                )
              }
            >
              {vm.distBusy
                ? "Running..."
                : vm.row.surplusHandled || vm.row.leftoversHandled
                ? "Re-run Distributions"
                : "Run Distributions"}
            </Button>
            <Button
              variant="ghost"
              disabled={vm.distBusy || surplusPoolMinor <= 0}
              onClick={() => vm.applyDistributions("SURPLUS", !!vm.row?.surplusHandled)}
            >
              Run Surplus Only
            </Button>
            <Button
              variant="ghost"
              disabled={vm.distBusy}
              onClick={() => vm.applyDistributions("LEFTOVERS", !!vm.row?.leftoversHandled)}
            >
              Run Leftovers Only
            </Button>
            <Button
              variant="danger"
              disabled={vm.distBusy}
              onClick={() => vm.undoDistributions("ALL")}
            >
              Undo Distributions
            </Button>
            <Button
              variant="ghost"
              disabled={vm.distBusy}
              onClick={() => vm.undoDistributions("SURPLUS")}
            >
              Undo Surplus
            </Button>
            <Button
              variant="ghost"
              disabled={vm.distBusy}
              onClick={() => vm.undoDistributions("LEFTOVERS")}
            >
              Undo Leftovers
            </Button>
            <Button
              variant="secondary"
              onClick={() => go(`/budgets/distributions/${vm.row?.budgetMonthKey}`)}
            >
              Manage Rules
            </Button>
          </div>

          <div className="budgetMonth__filters">
            <label className="budgetMonth__field">
              <div className="budgetMonth__label">Income Source Fund</div>
              <select
                className="budgetMonth__input"
                value={vm.incomeTransferFundId}
                onChange={(e) => {
                  vm.setIncomeTransferFundId(e.target.value);
                  vm.setIncomeTransferAssetId("");
                }}
              >
                <option value="">None</option>
                {vm.funds.map((f: any) => (
                  <option key={String(f.fundId)} value={String(f.fundId)}>
                    {String(f.name ?? f.fundId)}
                  </option>
                ))}
              </select>
            </label>

            <label className="budgetMonth__field">
              <div className="budgetMonth__label">Income Source Asset</div>
              <select
                className="budgetMonth__input"
                value={vm.incomeTransferAssetId}
                onChange={(e) => vm.setIncomeTransferAssetId(e.target.value)}
                disabled={!String(vm.incomeTransferFundId ?? "").trim()}
              >
                <option value="">Auto (single cash asset)</option>
                {(vm.cashAssetsByFund.get(String(vm.incomeTransferFundId ?? "")) ?? []).map(
                  (a: any) => (
                    <option key={String(a.assetId)} value={String(a.assetId)}>
                      {String(a.name ?? a.assetId)}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="budgetMonth__field">
              <div className="budgetMonth__label">Transfer Amount (minor units)</div>
              <input
                className="budgetMonth__input"
                value={vm.incomeTransferAmountMinor}
                onChange={(e) => vm.setIncomeTransferAmountMinor(e.target.value)}
                placeholder="Leave blank to use income-month total"
              />
            </label>

            <Button
              variant="secondary"
              disabled={vm.distBusy}
              onClick={() => vm.transferIncomeToSpending()}
            >
              Transfer Income to Spending
            </Button>
          </div>

          {!vm.distRulesLoading && vm.distRules.length > 0 ? (
            <div className="budgetMonth__rules">
              <DistributionsTable
                rows={vm.distRules}
                categoryNameById={categoryNameById}
                fundNameById={fundNameById}
                assetNameById={assetNameById}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      <BudgetLineEditorDialog
        open={lineDialogOpen}
        onOpenChange={(open) => {
          setLineDialogOpen(open);
          if (!open) setEditingLineCategoryId(null);
        }}
        budgetId={vm.row?.budgetId ?? null}
        categories={vm.categories}
        existingLines={vm.budgetLines}
        editing={editingBudgetLine}
        onSave={(input) => vm.upsertBudgetLine(input)}
      />

      {vm.editorOpen && vm.editor ? (
        <div className="budgetMonth__editor">
          <div className="budgetMonth__editorHeader">
            <div className="budgetMonth__editorTitle">
              {vm.hasBudget ? "Edit Budget" : "Create Budget"}
            </div>
          </div>

          <div className="budgetMonth__editorGrid">
            <label className="budgetMonth__field">
              <div className="budgetMonth__label">Budget month</div>
              <input
                className="budgetMonth__input"
                value={vm.editor.budgetMonthKey}
                onChange={(e) => vm.patchEditor({ budgetMonthKey: e.target.value })}
              />
            </label>

            <label className="budgetMonth__field">
              <div className="budgetMonth__label">Income month</div>
              <input
                className="budgetMonth__input"
                value={vm.editor.incomeMonthKey}
                onChange={(e) => vm.patchEditor({ incomeMonthKey: e.target.value })}
              />
            </label>

            <label className="budgetMonth__field">
              <div className="budgetMonth__label">Cap</div>
              <input
                className="budgetMonth__input"
                value={editorCapInput}
                onChange={(e) => setEditorCapInput(e.target.value)}
                onFocus={() => setEditorCapInput((prev) => moneyInputFocusValue(prev))}
                onBlur={() => setEditorCapInput((prev) => moneyInputBlurValue(prev))}
              />
            </label>

            <label className="budgetMonth__field">
              <div className="budgetMonth__label">Spending Fund (optional)</div>
              <select
                className="budgetMonth__input"
                value={String((vm.editor as any).spendingFundId ?? "")}
                onChange={(e) =>
                  vm.patchEditor({
                    spendingFundId: e.target.value ? e.target.value : null,
                    spendingAssetId: null,
                  })
                }
              >
                <option value="">None</option>
                {vm.funds.map((f: any) => (
                  <option key={String(f.fundId)} value={String(f.fundId)}>
                    {String(f.name ?? f.fundId)}
                  </option>
                ))}
              </select>
            </label>

            <label className="budgetMonth__field">
              <div className="budgetMonth__label">Spending Asset (optional)</div>
              <select
                className="budgetMonth__input"
                value={String((vm.editor as any).spendingAssetId ?? "")}
                onChange={(e) =>
                  vm.patchEditor({ spendingAssetId: e.target.value ? e.target.value : null })
                }
                disabled={!String((vm.editor as any).spendingFundId ?? "").trim()}
              >
                <option value="">Auto (single cash asset)</option>
                {(vm.cashAssetsByFund.get(String((vm.editor as any).spendingFundId ?? "")) ?? []).map(
                  (a: any) => (
                    <option key={String(a.assetId)} value={String(a.assetId)}>
                      {String(a.name ?? a.assetId)}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="budgetMonth__field">
              <div className="budgetMonth__label">Overage Fund (required)</div>
              <select
                className="budgetMonth__input"
                value={String((vm.editor as any).overageFundId ?? "")}
                onChange={(e) =>
                  vm.patchEditor({
                    overageFundId: e.target.value ? e.target.value : null,
                    overageAssetId: null,
                  })
                }
              >
                <option value="">Select fund</option>
                {vm.funds.map((f: any) => (
                  <option key={String(f.fundId)} value={String(f.fundId)}>
                    {String(f.name ?? f.fundId)}
                  </option>
                ))}
              </select>
            </label>

            <label className="budgetMonth__field">
              <div className="budgetMonth__label">Overage Asset (optional)</div>
              <select
                className="budgetMonth__input"
                value={String((vm.editor as any).overageAssetId ?? "")}
                onChange={(e) =>
                  vm.patchEditor({ overageAssetId: e.target.value ? e.target.value : null })
                }
                disabled={!String((vm.editor as any).overageFundId ?? "").trim()}
              >
                <option value="">Auto (single cash asset)</option>
                {(vm.cashAssetsByFund.get(String((vm.editor as any).overageFundId ?? "")) ?? []).map(
                  (a: any) => (
                    <option key={String(a.assetId)} value={String(a.assetId)}>
                      {String(a.name ?? a.assetId)}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="budgetMonth__field budgetMonth__field--full">
              <div className="budgetMonth__label">Notes</div>
              <textarea
                className="budgetMonth__input"
                value={vm.editor.notes ?? ""}
                onChange={(e) => vm.patchEditor({ notes: e.target.value })}
              />
            </label>
          </div>

          <div className="budgetMonth__editorActions">
            <Button variant="secondary" onClick={vm.closeEditor}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                let capMinor = 0;
                const raw = editorCapInput.trim();
                if (raw.length > 0) {
                  try {
                    capMinor = parseMoney(raw);
                  } catch {
                    return;
                  }
                }
                void vm.saveEditor(capMinor);
              }}
              disabled={vm.loading || !editorCapValid}
            >
              {vm.loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
