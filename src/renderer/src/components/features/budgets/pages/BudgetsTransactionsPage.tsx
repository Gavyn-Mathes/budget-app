// renderer/src/pages/BudgetsTransactionsPage.tsx
import React, { useMemo, useState } from "react";
import type { Transaction } from "../../../../../../shared/types/transaction";
import { useAppNavigate } from "../../../navigation/useAppNavigate";
import { Button } from "../../../ui/Button";
import { FeatureHeader } from "../../../layout/FeatureHeader";
import { formatMoney } from "../../../utils/formatMoney";
import { useTransactionsPage } from "../transactions/hooks/useTransactionsPage";
import { TransactionsTable } from "../transactions/components/TransactionsTable";
import { TransactionEditorDialog } from "../transactions/dialogs/TransactionEditorDialog";
import "../../../../styles/FeatureHeader.css";
import "../../../../styles/BudgetsTransactionsPage.css";

type Props = { onNavigate?: (path: string) => void };

export default function BudgetsTransactionsPage({ onNavigate }: Props) {
  const go = useAppNavigate(onNavigate);
  const vm = useTransactionsPage();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editing: Transaction | null = useMemo(() => {
    if (!editingId) return null;
    return vm.transactions.find((t) => t.transactionId === editingId) ?? null;
  }, [editingId, vm.transactions]);

  return (
    <div className="budgetsTx">
      <FeatureHeader
        title="Transactions"
        subtitle="Track expenses by category. Total spent updates automatically."
        right={
          <div className="budgetsTx__headerActions">
            <Button variant="secondary" onClick={() => go("/budgets")}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setEditingId(null);
                setOpen(true);
              }}
              disabled={vm.categories.length === 0}
              title={vm.categories.length === 0 ? "Add a category first" : undefined}
            >
              Add Transaction
            </Button>
          </div>
        }
      />

      <div className="budgetsTx__summaryRow">
        <div className="budgetsTx__monthPicker">
          <div className="budgetsTx__label">Month (YYYY-MM)</div>
          <input
            className="budgetsTx__input"
            value={vm.monthKey}
            onChange={(e) => vm.setMonthKey(e.target.value)}
            placeholder="2026-02"
          />
        </div>

        <div className="budgetsTx__summaryCard">
          <div className="budgetsTx__summaryLabel">Total spent</div>
          <div className="budgetsTx__summaryValue">{formatMoney(vm.spent)}</div>
          <div className="budgetsTx__summaryHint">Sum of all transactions in this month.</div>
        </div>
      </div>

      {vm.error ? <div className="budgetsTx__error">{vm.error}</div> : null}

      <div className="budgetsTx__panel">
        <div className="budgetsTx__panelHeader">
          <div className="budgetsTx__panelTitle">Entries</div>
          <div className="budgetsTx__panelSubtitle">Sorted by date (newest first).</div>
        </div>

        {vm.loading ? (
          <div className="budgetsTx__loading">Loading…</div>
        ) : vm.transactions.length === 0 ? (
          <div className="budgetsTx__empty">
            <div className="budgetsTx__emptyTitle">No transactions</div>
            <div className="budgetsTx__emptySubtitle">
              Add your first expense for {vm.monthKey}.
            </div>
            <Button
              variant="primary"
              onClick={() => {
                setEditingId(null);
                setOpen(true);
              }}
              disabled={vm.categories.length === 0}
            >
              Add Transaction
            </Button>
          </div>
        ) : (
          <TransactionsTable
            rows={vm.transactions}
            categoryNameById={vm.categoryNameById}
            onEdit={(id) => {
              setEditingId(id);
              setOpen(true);
            }}
            onDelete={(id) => vm.remove(id)}
          />
        )}
      </div>

      <TransactionEditorDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditingId(null);
        }}
        monthKey={vm.monthKey}
        categories={vm.categories}
        editing={editing}
        onSave={(draft) => vm.upsert(draft)}
      />
    </div>
  );
}
