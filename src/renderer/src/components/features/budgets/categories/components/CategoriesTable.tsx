// src/renderer/src/components/features/budgets/categories/components/CategoriesTable.tsx
import React from "react";
import type { Category } from "../../../../../../../shared/types/category";
import { Button } from "../../../../../components/ui/Button";

type Props = {
  rows: Category[];
  onEdit: (categoryId: string) => void;
  onDelete: (categoryId: string) => void;
};

export function CategoriesTable({ rows, onEdit, onDelete }: Props) {
  return (
    <table className="catsTable">
      <thead>
        <tr>
          <th>Name</th>
          <th className="catsTable__actionsCol">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((c) => (
          <tr key={c.categoryId}>
            <td className="catsTable__name">{c.name}</td>
            <td className="catsTable__actionsCol">
              <div className="catsTable__rowActions">
                <Button variant="secondary" onClick={() => onEdit(c.categoryId)}>
                  Rename
                </Button>
                <Button variant="danger" onClick={() => onDelete(c.categoryId)}>
                  Delete
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
