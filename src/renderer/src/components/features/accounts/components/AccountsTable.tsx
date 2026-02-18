// src/renderer/src/components/features/accounts/components/AccountsTable.tsx
import React from "react";
import { Button } from "../../../ui/Button";
import { formatMoney } from "../../../utils/formatMoney";
import { useAccountsPage } from "../hooks/useAccountsPage";

export function AccountsTable({ vm }: { vm: ReturnType<typeof useAccountsPage> }) {
  const accountTypeNameById = new Map<string, string>();
  for (const t of vm.accountTypes ?? []) {
    accountTypeNameById.set((t as any).accountTypeId, (t as any).accountType ?? "");
  }

  return (
    <div className="accountsPage__tableWrap">
      <table className="accountsPage__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Currency</th>
            <th className="accountsPage__num">Assets</th>
            <th className="accountsPage__num">Liabilities</th>
            <th className="accountsPage__num">Net</th>
            <th>Description</th>
            <th style={{ width: 220 }} />
          </tr>
        </thead>
        <tbody>
          {vm.loading ? (
            <tr>
              <td colSpan={8} className="accountsPage__muted">
                Loading...
              </td>
            </tr>
          ) : vm.rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="accountsPage__muted">
                No accounts yet. Create your first one.
              </td>
            </tr>
          ) : (
            vm.rows.map((a: any) => (
              <tr key={a.accountId}>
                <td>{a.name}</td>
                <td>{accountTypeNameById.get(a.accountTypeId) ?? a.accountTypeId}</td>
                <td>{a.defaultCurrencyCode}</td>
                <td className="accountsPage__num">{formatMoney(a.assetsMinor ?? 0, a.defaultCurrencyCode)}</td>
                <td className="accountsPage__num">{formatMoney(a.liabilitiesMinor ?? 0, a.defaultCurrencyCode)}</td>
                <td className="accountsPage__num">{formatMoney(a.netMinor ?? 0, a.defaultCurrencyCode)}</td>
                <td className="accountsPage__notes">{a.description ?? ""}</td>
                <td className="accountsPage__actions">
                  <Button variant="default" onClick={() => vm.openEdit(a)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => vm.requestDelete(a)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
