// src/renderer/src/pages/BudgetsCategoriesPage.tsx
import React, { useMemo, useState } from "react";
import type { Category } from "../../../../../../shared/types/category";
import { useAppNavigate } from "../../../navigation/useAppNavigate";
import { Button } from "../../../ui/Button";
import { FeatureHeader } from "../../../layout/FeatureHeader";
import { useCategoriesPage } from "../categories/hooks/useCategoriesPage";
import { CategoriesTable } from "../categories/components/CategoriesTable";
import { CategoryEditorDialog } from "../categories/dialogs/CategoryEditorDialog";
import "../../../../styles/FeatureHeader.css";
import "../../../../styles/BudgetsCategoriesPage.css";

type Props = { onNavigate?: (path: string) => void };

export default function BudgetsCategoriesPage({ onNavigate }: Props) {
  const go = useAppNavigate(onNavigate);
  const vm = useCategoriesPage();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editing: Category | null = useMemo(() => {
    if (!editingId) return null;
    return vm.rows.find((x) => x.categoryId === editingId) ?? null;
  }, [editingId, vm.rows]);

  return (
    <div className="budgetsCats">
      <FeatureHeader
        title="Categories"
        subtitle="Manage categories used by budgets and transactions."
        right={
          <div className="budgetsCats__headerActions">
            <Button variant="secondary" onClick={() => go("/budgets")}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setEditingId(null);
                setOpen(true);
              }}
            >
              Add Category
            </Button>
          </div>
        }
      />

      {vm.error ? <div className="budgetsCats__error">{vm.error}</div> : null}

      <div className="budgetsCats__panel">
        <div className="budgetsCats__panelHeader">
          <div className="budgetsCats__panelTitle">All Categories</div>
          <div className="budgetsCats__panelSubtitle">
            Sorted A–Z automatically.
          </div>
        </div>

        {vm.loading ? (
          <div className="budgetsCats__loading">Loading…</div>
        ) : vm.rows.length === 0 ? (
          <div className="budgetsCats__empty">
            <div className="budgetsCats__emptyTitle">No categories yet</div>
            <div className="budgetsCats__emptySubtitle">
              Add your first category for budgeting dropdowns.
            </div>
            <Button
              variant="primary"
              onClick={() => {
                setEditingId(null);
                setOpen(true);
              }}
            >
              Add Category
            </Button>
          </div>
        ) : (
          <CategoriesTable
            rows={vm.rows}
            onEdit={(id) => {
              setEditingId(id);
              setOpen(true);
            }}
            onDelete={(id) => vm.remove(id)}
          />
        )}
      </div>

      <CategoryEditorDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditingId(null);
        }}
        editing={editing}
        onSave={(input) => vm.upsert(input)}
      />
    </div>
  );
}
