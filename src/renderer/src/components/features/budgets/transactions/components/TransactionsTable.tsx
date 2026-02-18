// renderer/src/components/features/budgets/transactions/components/TransactionsTable.tsx
import React from "react";
import type { Transaction } from "../../../../../../../shared/types/transaction";
import { Button } from "../../../../../components/ui/Button";
import { formatMoney } from "../../../../utils/formatMoney";

type Props = {
  rows: Transaction[];
  categoryNameById: Map<string, string>;
  onEdit: (transactionId: string) => void;
  onDelete: (transactionId: string) => void;
};

export function TransactionsTable({ rows, categoryNameById, onEdit, onDelete }: Props) {
  return (
    <table className="txTable">
      <thead>
        <tr>
          <th>Date</th>
          <th>Category</th>
          <th className="txTable__num">Amount</th>
          <th>Notes</th>
          <th className="txTable__actionsCol">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((t) => (
          <tr key={t.transactionId}>
            <td className="txTable__date">{t.date}</td>
            <td className="txTable__cat">{categoryNameById.get(t.categoryId) ?? t.categoryId}</td>
            <td className="txTable__num">{formatMoney(t.amount ?? 0)}</td>
            <td className="txTable__notes">{t.notes ?? ""}</td>
            <td className="txTable__actionsCol">
              <div className="txTable__rowActions">
                <Button variant="secondary" onClick={() => onEdit(t.transactionId)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => onDelete(t.transactionId)}>
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
