// src/renderer/src/components/features/accounts/liabilities/components/AccountLiabilitiesTable.tsx
import React from "react";
import { formatMoney } from "../../../../../components/utils/formatMoney";
import { useAccountLiabilitiesPage } from "../hooks/useAccountLiabilitiesPage";

function formatLiabilityBalance(liability: any, accountCurrencyById: Map<string, string>) {
  return formatMoney(
    liability.balanceMinor ?? 0,
    accountCurrencyById.get(liability.accountId) ?? "USD"
  );
}

export function AccountLiabilitiesTable({ vm }: { vm: ReturnType<typeof useAccountLiabilitiesPage> }) {
  if (vm.loading) {
    return <div className="accountLiabilitiesPage__muted">Loading...</div>;
  }

  if (vm.accountId === "__ALL__") {
    return (
      <div className="accountLiabilitiesPage__groups">
        {vm.grouped.length === 0 ? (
          <div className="accountLiabilitiesPage__muted">No liabilities yet.</div>
        ) : (
          vm.grouped.map((g) => (
            <div key={g.accountId} className="accountLiabilitiesPage__group">
              <div className="accountLiabilitiesPage__groupHeader">
                <div className="accountLiabilitiesPage__groupTitle">{g.accountName}</div>
                <div className="accountLiabilitiesPage__muted">
                  {g.liabilities.length} liabilit{g.liabilities.length === 1 ? "y" : "ies"} -{" "}
                  {formatMoney(g.balanceMinor ?? 0, g.currencyCode)}
                </div>
              </div>

              <div className="accountLiabilitiesPage__tableWrap">
                <table className="accountLiabilitiesPage__table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th className="accountLiabilitiesPage__num">Balance</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.liabilities.map((l: any) => (
                      <tr key={l.liabilityId}>
                        <td>{l.name ?? l.liabilityId}</td>
                        <td>{l.liabilityType ?? "--"}</td>
                        <td className="accountLiabilitiesPage__num">
                          {formatLiabilityBalance(l, vm.accountCurrencyById)}
                        </td>
                        <td className="accountLiabilitiesPage__notes">{l.notes ?? ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="accountLiabilitiesPage__tableWrap">
      <table className="accountLiabilitiesPage__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th className="accountLiabilitiesPage__num">Balance</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {vm.filteredLiabilities.length === 0 ? (
            <tr>
              <td colSpan={4} className="accountLiabilitiesPage__muted">
                No liabilities for this account.
              </td>
            </tr>
          ) : (
            vm.filteredLiabilities.map((l: any) => (
              <tr key={l.liabilityId}>
                <td>{l.name ?? l.liabilityId}</td>
                <td>{l.liabilityType ?? "--"}</td>
                <td className="accountLiabilitiesPage__num">
                  {formatLiabilityBalance(l, vm.accountCurrencyById)}
                </td>
                <td className="accountLiabilitiesPage__notes">{l.notes ?? ""}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
