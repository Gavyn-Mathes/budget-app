// src/renderer/src/components/features/budgets/distributions/components/DistributionsTable.tsx
import React from "react";
import type { DistributionRule } from "../../../../../../../shared/types/distribution";
import { Button } from "../../../../../components/ui/Button";
import { formatMoney } from "../../../../utils/formatMoney";

type Props = {
  rows: DistributionRule[];
  categoryNameById: Map<string, string>;
  fundNameById: Map<string, string>;
  assetNameById: Map<string, string>;
  onEdit?: (distributionRuleId: string) => void;
  onDelete?: (distributionRuleId: string) => void;
};

function formatPercent(p: number | null): string {
  if (p === null || !Number.isFinite(p)) return "0%";
  const pct = p * 100;
  const rounded = Math.round(pct * 100) / 100;
  return `${rounded.toFixed(2)}%`;
}

export function DistributionsTable({
  rows,
  categoryNameById,
  fundNameById,
  assetNameById,
  onEdit,
  onDelete,
}: Props) {
  const showActions = Boolean(onEdit || onDelete);

  return (
    <table className="distTable">
      <thead>
        <tr>
          <th>Source</th>
          <th>Allocation</th>
          <th>Target</th>
          {showActions ? <th className="distTable__actionsCol">Actions</th> : null}
        </tr>
      </thead>
      <tbody>
        {rows.map((rule) => {
          const sourceLabel =
            rule.sourceType === "SURPLUS"
              ? "Surplus"
              : categoryNameById.get(rule.categoryId ?? "") ?? rule.categoryId ?? "Category";

          const allocationLabel =
            rule.allocationType === "FIXED"
              ? formatMoney(rule.fixedAmount ?? 0)
              : formatPercent(rule.percent ?? 0);

          const fundLabel = fundNameById.get(rule.fundId) ?? rule.fundId;
          const assetLabel = rule.assetId
            ? assetNameById.get(rule.assetId) ?? rule.assetId
            : "Auto cash asset";

          return (
            <tr key={rule.distributionRuleId}>
              <td>
                <div className="distTable__cellTitle">{sourceLabel}</div>
                <div className="distTable__cellSub">
                  {rule.sourceType === "SURPLUS" ? "All surplus funds" : "Category balance"}
                </div>
              </td>
              <td>
                <div className="distTable__cellTitle">{allocationLabel}</div>
                <div className="distTable__cellSub">{rule.allocationType}</div>
              </td>
              <td>
                <div className="distTable__cellTitle">{fundLabel}</div>
                <div className="distTable__cellSub">{assetLabel}</div>
              </td>
              {showActions ? (
                <td className="distTable__actionsCol">
                  <div className="distTable__rowActions">
                    {onEdit ? (
                      <Button variant="secondary" onClick={() => onEdit(rule.distributionRuleId)}>
                        Edit
                      </Button>
                    ) : null}
                    {onDelete ? (
                      <Button variant="danger" onClick={() => onDelete(rule.distributionRuleId)}>
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
