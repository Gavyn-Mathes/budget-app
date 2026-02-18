// src/renderer/src/components/features/funds/components/FundsTable.tsx
import React from "react";
import { Button } from "../../../ui/Button";
import { formatMoney } from "../../../utils/formatMoney";
import { useFundsPage } from "../hooks/useFundsPage";

export function FundsTable({ vm }: { vm: ReturnType<typeof useFundsPage> }) {
  return (
    <>
      {vm.error ? <div className="funds__error">Error: {vm.error}</div> : null}

      <div className="funds__card">
        {vm.loading ? (
          <div className="funds__muted">Loading...</div>
        ) : vm.rows.length === 0 ? (
          <div className="funds__muted">No funds yet. Add your first fund.</div>
        ) : (
          <table className="funds__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th className="funds__right">Assets</th>
                <th className="funds__right">Liabilities</th>
                <th className="funds__right">Net</th>
                <th className="funds__right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vm.rows.map((f) => {
                const id = String((f as any).fundId);
                const assetsMinor = (f as any).assetsMinor;
                const liabilitiesMinor = (f as any).liabilitiesMinor;
                const netMinor = (f as any).netMinor;

                return (
                  <tr key={id}>
                    <td className="funds__name">{(f as any).name}</td>
                    <td className="funds__desc">{(f as any).description ?? ""}</td>
                    <td className="funds__right">{formatMoney(assetsMinor)}</td>
                    <td className="funds__right">{formatMoney(liabilitiesMinor)}</td>
                    <td className="funds__right">{formatMoney(netMinor)}</td>
                    <td className="funds__right">
                      <Button className="funds__btn" onClick={() => vm.openEdit(f as any)} disabled={vm.loading}>
                        Edit
                      </Button>
                      <Button
                        className="funds__btn"
                        variant="danger"
                        onClick={() => vm.requestDelete(f as any)}
                        disabled={vm.loading}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
