// src/renderer/src/components/features/funds/events/lines/components/FundEventLinesTable.tsx
import React from "react";
import { formatMoney } from "../../../../../../components/utils/formatMoney";
import { QTY_SCALE } from "../../../../../../../../shared/constants/precision";
import type { FundEventWithLines } from "../../../../../../../../shared/types/fund_event_line";

function formatQuantityDelta(quantityDeltaMinor: number): string {
  const qty = quantityDeltaMinor / QTY_SCALE;
  const sign = qty > 0 ? "+" : "";
  return `${sign}${qty.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  })}`;
}

function formatMoneyDelta(moneyDeltaMinor: number): string {
  const sign = moneyDeltaMinor > 0 ? "+" : "";
  return `${sign}${formatMoney(moneyDeltaMinor)}`;
}

function changeText(line: FundEventWithLines["lines"][number]): string {
  if (line.lineKind === "ASSET_QUANTITY") {
    return formatQuantityDelta(line.quantityDeltaMinor);
  }
  return formatMoneyDelta(line.moneyDelta);
}

function changeClass(line: FundEventWithLines["lines"][number]): string {
  const value = line.lineKind === "ASSET_QUANTITY" ? line.quantityDeltaMinor : line.moneyDelta;
  if (value > 0) return "linesTable__change linesTable__change--positive";
  if (value < 0) return "linesTable__change linesTable__change--negative";
  return "linesTable__change";
}

function targetText(line: FundEventWithLines["lines"][number]): string {
  if (line.assetId) return `Asset: ${line.assetId}`;
  return `Liability: ${line.liabilityId}`;
}

export function FundEventLinesTable({ lines }: { lines: FundEventWithLines["lines"] }) {
  return (
    <div className="linesTable">
      <table className="linesTable__table">
        <thead>
          <tr>
            <th>#</th>
            <th>Kind</th>
            <th>Target</th>
            <th className="linesTable__num">Change</th>
            <th className="linesTable__num">Fee</th>
            <th className="linesTable__num">Unit Price</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {lines.length === 0 ? (
            <tr>
              <td colSpan={7} className="linesTable__muted">
                No lines on this event.
              </td>
            </tr>
          ) : (
            lines.map((line) => (
              <tr key={line.lineId}>
                <td>{line.lineNo}</td>
                <td>{line.lineKind}</td>
                <td>{targetText(line)}</td>
                <td className={changeClass(line)}>{changeText(line)}</td>
                <td className="linesTable__num">
                  {line.fee == null ? "--" : formatMoney(line.fee)}
                </td>
                <td className="linesTable__num">{line.unitPrice ?? "--"}</td>
                <td className="linesTable__notes">{line.notes ?? ""}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
