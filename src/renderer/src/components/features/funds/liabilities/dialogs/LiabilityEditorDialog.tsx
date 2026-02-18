// src/renderer/src/components/features/funds/liabilities/dialogs/LiabilityEditorDialog.tsx
import React from "react";
import { Button } from "../../../../../components/ui/Button";
import { useFundsLiabilitiesPage } from "../hooks/useFundsLiabilitiesPage";
import { LIABILITY_TYPE, MIN_PAYMENT_TYPE, PAYMENT_FREQUENCY } from "../../../../../../../shared/constants/liability";

export function LiabilityEditorDialog({ vm }: { vm: ReturnType<typeof useFundsLiabilitiesPage> }) {
  const e = vm.editor;
  if (!vm.editorOpen || !e) return null;

  const name = String(e.name ?? "").trim();
  const hasAccounts = vm.accounts.length > 0;

  function accountLocationLabel(account: any): string {
    const accountName = String(account?.name ?? account?.accountId ?? "").trim();
    const accountTypeName = vm.accountTypeNameById.get(String(account?.accountTypeId ?? "")) ?? "";
    return accountTypeName ? `${accountName} (${accountTypeName})` : accountName;
  }

  return (
    <div className="fundsDialog__backdrop" onMouseDown={vm.closeEditor}>
      <div className="fundsDialog__panel" onMouseDown={(ev) => ev.stopPropagation()}>
        <div className="fundsDialog__header">
          <div className="fundsDialog__title">{e.liabilityId ? "Edit Liability" : "Add Liability"}</div>
          <button className="fundsDialog__close" onClick={vm.closeEditor} aria-label="Close">
            x
          </button>
        </div>

        <div className="fundsDialog__body">
          <div className="fundLiabForm">
            <label className="fundLiabField">
              <span>Liability Type</span>
              <select
                value={String(e.liabilityType ?? "")}
                onChange={(ev) => vm.patchEditor({ liabilityType: ev.target.value })}
              >
                {LIABILITY_TYPE.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="fundLiabField">
              <span>Fund</span>
              <select value={String(e.fundId ?? "")} onChange={(ev) => vm.patchEditor({ fundId: ev.target.value })}>
                <option value="" disabled>
                  Select...
                </option>
                {vm.funds.map((f: any) => (
                  <option key={String(f.fundId)} value={String(f.fundId)}>
                    {String(f.name ?? "")}
                  </option>
                ))}
              </select>
            </label>

            <label className="fundLiabField">
              <span>Physical Account Location</span>
              <select
                disabled={!hasAccounts}
                value={String(e.accountId ?? "")}
                onChange={(ev) => vm.patchEditor({ accountId: ev.target.value })}
              >
                <option value="" disabled>
                  {hasAccounts ? "Select..." : "No accounts"}
                </option>
                {vm.accounts.map((a: any) => (
                  <option key={String(a.accountId)} value={String(a.accountId)}>
                    {accountLocationLabel(a)}
                  </option>
                ))}
              </select>
            </label>

            <label className="fundLiabField">
              <span>Name</span>
              <input
                value={e.name ?? ""}
                onChange={(ev) => vm.patchEditor({ name: ev.target.value })}
                placeholder="Car loan, Credit card, etc."
              />
            </label>

            <label className="fundLiabField">
              <span>APR (0..1)</span>
              <input
                type="number"
                min="0"
                max="1"
                step="0.0001"
                value={String(e.aprInput ?? "")}
                onChange={(ev) => vm.patchEditor({ aprInput: ev.target.value })}
                placeholder="0.1999"
              />
            </label>

            <label className="fundLiabField">
              <span>Opened Date</span>
              <input
                type="date"
                value={String(e.openedDate ?? "")}
                onChange={(ev) => vm.patchEditor({ openedDate: ev.target.value })}
              />
            </label>

            <label className="fundLiabField">
              <span>Active</span>
              <input
                type="checkbox"
                checked={Boolean(e.isActive)}
                onChange={(ev) => vm.patchEditor({ isActive: ev.target.checked })}
              />
            </label>

            <label className="fundLiabField">
              <span>Notes</span>
              <input
                value={e.notes ?? ""}
                onChange={(ev) => vm.patchEditor({ notes: ev.target.value })}
                placeholder="Optional"
              />
            </label>

            {e.liabilityType === "LOAN" ? (
              <>
                <label className="fundLiabField">
                  <span>Original Principal</span>
                  <input
                    value={String(e.originalPrincipalInput ?? "")}
                    onChange={(ev) => vm.patchEditor({ originalPrincipalInput: ev.target.value })}
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </label>

                <label className="fundLiabField">
                  <span>Maturity Date</span>
                  <input
                    type="date"
                    value={String(e.maturityDate ?? "")}
                    onChange={(ev) => vm.patchEditor({ maturityDate: ev.target.value })}
                  />
                </label>

                <label className="fundLiabField">
                  <span>Payment Amount</span>
                  <input
                    value={String(e.paymentAmountInput ?? "")}
                    onChange={(ev) => vm.patchEditor({ paymentAmountInput: ev.target.value })}
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </label>

                <label className="fundLiabField">
                  <span>Payment Frequency</span>
                  <select
                    value={String(e.paymentFrequency ?? "")}
                    onChange={(ev) => vm.patchEditor({ paymentFrequency: ev.target.value })}
                  >
                    <option value="">None</option>
                    {PAYMENT_FREQUENCY.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : null}

            {e.liabilityType === "CREDIT" ? (
              <>
                <label className="fundLiabField">
                  <span>Credit Limit</span>
                  <input
                    value={String(e.creditLimitInput ?? "")}
                    onChange={(ev) => vm.patchEditor({ creditLimitInput: ev.target.value })}
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </label>

                <label className="fundLiabField">
                  <span>Due Day (1-31)</span>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    step="1"
                    value={String(e.dueDay ?? "")}
                    onChange={(ev) => vm.patchEditor({ dueDay: ev.target.value })}
                  />
                </label>

                <label className="fundLiabField">
                  <span>Minimum Payment Type</span>
                  <select
                    value={String(e.minPaymentType ?? "")}
                    onChange={(ev) => vm.patchEditor({ minPaymentType: ev.target.value })}
                  >
                    <option value="">None</option>
                    {MIN_PAYMENT_TYPE.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="fundLiabField">
                  <span>
                    Minimum Payment Value
                    {e.minPaymentType === "PERCENT" ? " (0-100)" : ""}
                  </span>
                  <input
                    value={String(e.minPaymentValueInput ?? "")}
                    onChange={(ev) => vm.patchEditor({ minPaymentValueInput: ev.target.value })}
                    placeholder={e.minPaymentType === "PERCENT" ? "5" : "0.00"}
                    inputMode="decimal"
                    disabled={!e.minPaymentType}
                  />
                </label>

                <label className="fundLiabField">
                  <span>Statement Day (1-31)</span>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    step="1"
                    value={String(e.statementDay ?? "")}
                    onChange={(ev) => vm.patchEditor({ statementDay: ev.target.value })}
                  />
                </label>
              </>
            ) : null}
          </div>
        </div>

        <div className="fundsDialog__footer">
          <Button onClick={vm.closeEditor} disabled={vm.loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={vm.saveEditor} disabled={vm.loading || !name || !hasAccounts}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
