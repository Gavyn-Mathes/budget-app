import React from "react";
import type { BudgetLine } from "../../../../../../../shared/types/budget_line";
import { formatMoney } from "../../../../utils/formatMoney";
import { Button } from "../../../../../components/ui/Button";

type Props = {
  rows: BudgetLine[];
  categoryNameById: Map<string, string>;
  spendablePoolMinor?: number | null;
  percentBaseMinor?: number | null;
  remainingByCategory?: Map<string, number>;
  onEdit?: (categoryId: string) => void;
  onDelete?: (categoryId: string) => void;
};

function formatPercent(p: number | null): string {
  if (p === null || !Number.isFinite(p)) return "0%";
  const pct = p * 100;
  const rounded = Math.round(pct * 100) / 100;
  return `${rounded.toFixed(2)}%`;
}

function toPercentOfPoolLabel(
  fixedMinor: number,
  poolMinor: number | null | undefined
): string {
  const base = Number(poolMinor ?? 0);
  if (!Number.isFinite(base) || base <= 0) return "-- of Allocation Pool";
  const ratio = fixedMinor / base;
  return `${formatPercent(ratio)} of Allocation Pool`;
}

function toFixedOfRemainingLabel(
  percent: number,
  remainingMinor: number | null | undefined
): string {
  const base = Number(remainingMinor ?? 0);
  if (!Number.isFinite(base) || base <= 0) return "-- of Remaining";
  const fixed = Math.round(percent * base);
  return `${formatMoney(fixed)} of Remaining`;
}

export function BudgetLinesTable({
  rows,
  categoryNameById,
  spendablePoolMinor = null,
  percentBaseMinor = null,
  remainingByCategory = new Map<string, number>(),
  onEdit,
  onDelete,
}: Props) {
  const showActions = Boolean(onEdit || onDelete);

  return (
    <table className="distTable">
      <thead>
        <tr>
          <th>Category</th>
          <th>Allocation</th>
          <th>Left</th>
          {showActions ? <th className="distTable__actionsCol">Actions</th> : null}
        </tr>
      </thead>
      <tbody>
        {rows.map((line) => {
          const categoryLabel = categoryNameById.get(line.categoryId) ?? line.categoryId;
          const allocationLabel =
            line.allocationType === "FIXED"
              ? formatMoney(line.fixedAmount ?? 0)
              : formatPercent(line.percent ?? 0);
          const convertedLabel =
            line.allocationType === "FIXED"
              ? toPercentOfPoolLabel(line.fixedAmount ?? 0, spendablePoolMinor)
              : toFixedOfRemainingLabel(line.percent ?? 0, percentBaseMinor);
          const leftMinor = remainingByCategory.get(line.categoryId);

          return (
            <tr key={line.categoryId}>
              <td>
                <div className="distTable__cellTitle">{categoryLabel}</div>
              </td>
              <td>
                <div className="distTable__cellTitle">{allocationLabel}</div>
                <div className="distTable__cellSub">
                  {line.allocationType} - {convertedLabel}
                </div>
              </td>
              <td>
                <div className="distTable__cellTitle">
                  {leftMinor == null ? "--" : formatMoney(leftMinor)}
                </div>
                <div className="distTable__cellSub">Planned - Spent</div>
              </td>
              {showActions ? (
                <td className="distTable__actionsCol">
                  <div className="distTable__rowActions">
                    {onEdit ? (
                      <Button variant="secondary" onClick={() => onEdit(line.categoryId)}>
                        Edit
                      </Button>
                    ) : null}
                    {onDelete ? (
                      <Button variant="danger" onClick={() => onDelete(line.categoryId)}>
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </td>
              ) : null}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
