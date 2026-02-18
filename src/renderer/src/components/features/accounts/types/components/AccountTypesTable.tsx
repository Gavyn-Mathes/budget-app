// src/renderer/src/components/features/accounts/types/components/AccountTypesTable.tsx
import React from "react";
import { Button } from "../../../../../components/ui/Button";
import { useAccountTypesPage } from "../hooks/useAccountTypesPage";

export function AccountTypesTable({ vm }: { vm: ReturnType<typeof useAccountTypesPage> }) {
  return (
    <div className="accountTypesPage__tableWrap">
      <table className="accountTypesPage__table">
        <thead>
          <tr>
            <th>Type</th>
            <th style={{ width: 220 }} />
          </tr>
        </thead>
        <tbody>
          {vm.loading ? (
            <tr>
              <td colSpan={2} className="accountTypesPage__muted">
                Loading...
              </td>
            </tr>
          ) : vm.rows.length === 0 ? (
            <tr>
              <td colSpan={2} className="accountTypesPage__muted">
                No account types yet.
              </td>
            </tr>
          ) : (
            vm.rows.map((t: any) => (
              <tr key={t.accountTypeId}>
                <td>{t.accountType}</td>
                <td className="accountTypesPage__actions">
                  <Button variant="default" onClick={() => vm.openEdit(t)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => vm.requestDelete(t)}>
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
