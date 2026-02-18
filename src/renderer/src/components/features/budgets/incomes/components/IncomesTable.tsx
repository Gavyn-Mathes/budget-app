// src/renderer/src/components/features/budgets/income/components/IncomesTable.tsx
import React from "react";
import type { Income } from "../../../../../../../shared/types/income";
import { Button } from "../../../../../components/ui/Button";
import { formatMoney, toMoneyInputString } from "../../../../utils/formatMoney";

type Props = {
  incomes: Income[];
  onEdit: (incomeId: string) => void;
  onDelete: (incomeId: string) => void;
};

export function IncomesTable({ incomes, onEdit, onDelete }: Props) {
  return (
    <table className="incomesTable">
      <thead>
        <tr>
          <th>Name</th>
          <th>Date</th>
          <th className="incomesTable__num">Amount</th>
          <th>Notes</th>
          <th className="incomesTable__actionsCol">Actions</th>
        </tr>
      </thead>
      <tbody>
        {incomes.map((inc) => (
          <tr key={inc.incomeId}>
            <td className="incomesTable__name">{inc.name}</td>
            <td className="incomesTable__date">{inc.date}</td>
            <td className="incomesTable__num">
              {formatMoney(inc.amount ?? 0)}
            </td>
            <td className="incomesTable__notes">{inc.notes ?? ""}</td>
            <td className="incomesTable__actionsCol">
              <div className="incomesTable__rowActions">
                <Button variant="secondary" onClick={() => onEdit(inc.incomeId)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => onDelete(inc.incomeId)}>
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
