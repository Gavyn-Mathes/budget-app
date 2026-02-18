// src/renderer/src/components/features/funds/liabilities/dialogs/LiabilityShowDialog.tsx
import React from "react";
import { Button } from "../../../../../components/ui/Button";
import { useFundsLiabilitiesPage } from "../hooks/useFundsLiabilitiesPage";

export function LiabilityShowDialog({ vm }: { vm: ReturnType<typeof useFundsLiabilitiesPage> }) {
  const l = vm.showTarget;
  if (!vm.showOpen || !l) return null;

  const fundName = vm.fundNameById.get(String(l.fundId ?? "")) ?? "-";
  const accountName = l.accountId
    ? vm.accountNameById.get(String(l.accountId)) ?? String(l.accountId)
    : "-";

  return (
    <div className="fundsDialog__backdrop" onMouseDown={vm.closeShow}>
      <div className="fundsDialog__panel" onMouseDown={(ev) => ev.stopPropagation()}>
        <div className="fundsDialog__header">
          <div className="fundsDialog__title">Liability details</div>
          <button className="fundsDialog__close" onClick={vm.closeShow} aria-label="Close">
            x
          </button>
        </div>

        <div className="fundsDialog__body">
          <div className="fundLiabShow">
            <div>
              <span className="fundLiabShow__k">Name:</span> {String(l.name ?? "")}
            </div>
            <div>
              <span className="fundLiabShow__k">Type:</span> {String(l.liabilityType ?? "")}
            </div>
            <div>
              <span className="fundLiabShow__k">Fund:</span> {fundName}
            </div>
            <div>
              <span className="fundLiabShow__k">Account:</span> {accountName}
            </div>
            <div>
              <span className="fundLiabShow__k">APR:</span> {l.apr == null ? "-" : String(l.apr)}
            </div>
            <div>
              <span className="fundLiabShow__k">Opened Date:</span> {l.openedDate ?? "-"}
            </div>
            <div>
              <span className="fundLiabShow__k">Active:</span> {l.isActive ? "Yes" : "No"}
            </div>
            <div>
              <span className="fundLiabShow__k">Notes:</span> {l.notes ?? "-"}
            </div>

            {l.liabilityType === "LOAN" ? (
              <>
                <div>
                  <span className="fundLiabShow__k">Original Principal:</span>{" "}
                  {l.originalPrincipal == null ? "-" : String(l.originalPrincipal)}
                </div>
                <div>
                  <span className="fundLiabShow__k">Maturity Date:</span> {l.maturityDate ?? "-"}
                </div>
                <div>
                  <span className="fundLiabShow__k">Payment Amount:</span>{" "}
                  {l.paymentAmount == null ? "-" : String(l.paymentAmount)}
                </div>
                <div>
                  <span className="fundLiabShow__k">Payment Frequency:</span> {l.paymentFrequency ?? "-"}
                </div>
              </>
            ) : null}

            {l.liabilityType === "CREDIT" ? (
              <>
                <div>
                  <span className="fundLiabShow__k">Credit Limit:</span>{" "}
                  {l.creditLimit == null ? "-" : String(l.creditLimit)}
                </div>
                <div>
                  <span className="fundLiabShow__k">Due Day:</span>{" "}
                  {l.dueDay == null ? "-" : String(l.dueDay)}
                </div>
                <div>
                  <span className="fundLiabShow__k">Min Payment Type:</span> {l.minPaymentType ?? "-"}
                </div>
                <div>
                  <span className="fundLiabShow__k">Min Payment Value:</span>{" "}
                  {l.minPaymentValue == null ? "-" : String(l.minPaymentValue)}
                </div>
                <div>
                  <span className="fundLiabShow__k">Statement Day:</span>{" "}
                  {l.statementDay == null ? "-" : String(l.statementDay)}
                </div>
              </>
            ) : null}

            {"liabilityId" in l ? (
              <div>
                <span className="fundLiabShow__k">Liability ID:</span> {String(l.liabilityId)}
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
              vm.openEdit(l);
            }}
          >
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}
