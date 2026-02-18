// src/renderer/src/components/features/funds/liabilities/components/LiabilitiesTable.tsx
import React from "react";
import { Button } from "../../../../ui/Button";
import { formatMoney } from "../../../../utils/formatMoney";
import { useFundsLiabilitiesPage } from "../hooks/useFundsLiabilitiesPage";

function balanceText(vm: ReturnType<typeof useFundsLiabilitiesPage>, liability: any): string {
  const currency = vm.accountCurrencyById.get(String(liability.accountId ?? "")) ?? "USD";
  return formatMoney(liability.balanceMinor ?? 0, currency);
}

export function LiabilitiesTable({ vm }: { vm: ReturnType<typeof useFundsLiabilitiesPage> }) {
  if (vm.loading) return <div className="fundLiab__muted">Loading...</div>;

  if (vm.grouped.length === 0) {
    return <div className="fundLiab__muted">No liabilities yet. Add your first liability.</div>;
  }

  return (
    <div className="fundLiab__groups">
      {vm.grouped.map(([fundName, rows]) => {
        const groupBalanceMinor = rows.reduce(
          (sum: number, liability: any) => sum + (liability.balanceMinor ?? 0),
          0
        );

        return (
          <div key={fundName} className="fundLiab__group">
            <div className="fundLiab__groupHeader">
              <div className="fundLiab__groupTitle">{fundName}</div>
              <div className="fundLiab__groupCount">
                {rows.length} {rows.length === 1 ? "liability" : "liabilities"} -{" "}
                {formatMoney(groupBalanceMinor)}
              </div>
            </div>

            <table className="fundLiab__table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Fund</th>
                  <th>Account Location</th>
                  <th>Name</th>
                  <th className="fundLiab__num">Balance</th>
                  <th className="fundLiab__right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l: any) => (
                  <tr key={String(l.liabilityId)}>
                    <td>{String(l.liabilityType ?? "")}</td>
                    <td>{fundName}</td>
                    <td>
                      {l.accountId
                        ? vm.accountNameById.get(String(l.accountId)) ?? String(l.accountId)
                        : "-"}
                    </td>
                    <td className="fundLiab__name">{String(l.name ?? "")}</td>
                    <td className="fundLiab__num">{balanceText(vm, l)}</td>
                    <td className="fundLiab__right">
                      <Button
                        className="fundLiab__btn"
                        variant="secondary"
                        onClick={() => vm.openShow(l)}
                        disabled={vm.loading}
                      >
                        Show
                      </Button>
                      <Button className="fundLiab__btn" onClick={() => vm.openEdit(l)} disabled={vm.loading}>
                        Edit
                      </Button>
                      <Button
                        className="fundLiab__btn"
                        variant="danger"
                        onClick={() => vm.requestDelete(l)}
                        disabled={vm.loading}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
