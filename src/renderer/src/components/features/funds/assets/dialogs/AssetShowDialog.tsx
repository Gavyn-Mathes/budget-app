// src/renderer/src/components/features/funds/assets/dialogs/AssetShowDialog.tsx
import React from "react";
import { Button } from "../../../../../components/ui/Button";
import { useFundsAssetsPage } from "../hooks/useFundsAssetsPage";

export function AssetShowDialog({ vm }: { vm: ReturnType<typeof useFundsAssetsPage> }) {
  const a = vm.showTarget;
  if (!vm.showOpen || !a) return null;

  const fundName = vm.fundNameById.get(String(a.fundId ?? "")) ?? "-";
  const accountName =
    a.accountId != null
      ? vm.accountNameById.get(String(a.accountId)) ?? String(a.accountId)
      : "-";

  return (
    <div className="fundsDialog__backdrop" onMouseDown={vm.closeShow}>
      <div className="fundsDialog__panel" onMouseDown={(ev) => ev.stopPropagation()}>
        <div className="fundsDialog__header">
          <div className="fundsDialog__title">Asset details</div>
          <button className="fundsDialog__close" onClick={vm.closeShow} aria-label="Close">
            x
          </button>
        </div>

        <div className="fundsDialog__body">
          <div className="fundAssetsShow">
            <div>
              <span className="fundAssetsShow__k">Name:</span> {String(a.name ?? "")}
            </div>
            <div>
              <span className="fundAssetsShow__k">Type:</span> {String(a.assetType ?? "")}
            </div>
            <div>
              <span className="fundAssetsShow__k">Fund:</span> {fundName}
            </div>
            <div>
              <span className="fundAssetsShow__k">Account:</span> {accountName}
            </div>
            {a.assetType === "CASH" ? (
              <div>
                <span className="fundAssetsShow__k">Currency:</span> {String(a.currencyCode ?? "")}
              </div>
            ) : null}
            {a.assetType === "STOCK" ? (
              <div>
                <span className="fundAssetsShow__k">Ticker:</span> {String(a.ticker ?? "")}
              </div>
            ) : null}
            {a.assetType === "NOTE" ? (
              <>
                <div>
                  <span className="fundAssetsShow__k">Counterparty:</span> {a.counterparty ?? "-"}
                </div>
                <div>
                  <span className="fundAssetsShow__k">Interest Rate:</span> {String(a.interestRate ?? 0)}
                </div>
                <div>
                  <span className="fundAssetsShow__k">Start Date:</span> {a.startDate ?? "-"}
                </div>
                <div>
                  <span className="fundAssetsShow__k">Maturity Date:</span> {a.maturityDate ?? "-"}
                </div>
              </>
            ) : null}
            {"assetId" in a ? (
              <div>
                <span className="fundAssetsShow__k">Asset ID:</span> {String(a.assetId)}
              </div>
            ) : null}
          </div>
        </div>

        <div className="fundsDialog__footer">
          <Button variant="secondary" onClick={vm.closeShow}>
            Close
          </Button>
          <Button
            onClick={() => {
              vm.closeShow();
              vm.openEdit(a);
            }}
          >
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}
