// src/renderer/src/components/features/funds/assets/dialogs/AssetEditorDialog.tsx
import React from "react";
import { Button } from "../../../../../components/ui/Button";
import { useFundsAssetsPage } from "../hooks/useFundsAssetsPage";
import { ASSET_TYPE } from "../../../../../../../shared/constants/asset";

export function AssetEditorDialog({ vm }: { vm: ReturnType<typeof useFundsAssetsPage> }) {
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
          <div className="fundsDialog__title">{e.assetId ? "Edit Asset" : "Add Asset"}</div>
          <button className="fundsDialog__close" onClick={vm.closeEditor} aria-label="Close">
            x
          </button>
        </div>

        <div className="fundsDialog__body">
          <div className="fundAssetsForm">
            <label className="fundAssetsField">
              <span>Type</span>
              <select
                value={String(e.assetType ?? "")}
                onChange={(ev) => vm.patchEditor({ assetType: ev.target.value })}
              >
                <option value="" disabled>
                  Select...
                </option>
                {ASSET_TYPE.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="fundAssetsField">
              <span>Fund</span>
              <select
                value={String(e.fundId ?? "")}
                onChange={(ev) => vm.patchEditor({ fundId: ev.target.value })}
              >
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

            <label className="fundAssetsField">
              <span>Physical account location</span>
              <select
                value={String(e.accountId ?? "")}
                onChange={(ev) => vm.patchEditor({ accountId: ev.target.value })}
                disabled={!hasAccounts}
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

            <label className="fundAssetsField">
              <span>Name</span>
              <input
                value={e.name ?? ""}
                onChange={(ev) => vm.patchEditor({ name: ev.target.value })}
                placeholder="USD Cash, AAPL, etc."
              />
            </label>

            <label className="fundAssetsField">
              <span>Description</span>
              <input
                value={e.description ?? ""}
                onChange={(ev) => vm.patchEditor({ description: ev.target.value })}
                placeholder="Optional"
              />
            </label>

            {e.assetType === "CASH" ? (
              <label className="fundAssetsField">
                <span>Currency Code</span>
                <input
                  value={e.currencyCode ?? ""}
                  onChange={(ev) => vm.patchEditor({ currencyCode: ev.target.value.toUpperCase() })}
                  placeholder="USD"
                />
              </label>
            ) : null}

            {e.assetType === "STOCK" ? (
              <label className="fundAssetsField">
                <span>Ticker</span>
                <input
                  value={e.ticker ?? ""}
                  onChange={(ev) => vm.patchEditor({ ticker: ev.target.value.toUpperCase() })}
                  placeholder="AAPL"
                />
              </label>
            ) : null}

            {e.assetType === "NOTE" ? (
              <>
                <label className="fundAssetsField">
                  <span>Counterparty</span>
                  <input
                    value={e.counterparty ?? ""}
                    onChange={(ev) => vm.patchEditor({ counterparty: ev.target.value || null })}
                    placeholder="Optional"
                  />
                </label>

                <label className="fundAssetsField">
                  <span>Interest Rate (0..1)</span>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.0001"
                    value={String(e.interestRate ?? 0)}
                    onChange={(ev) => vm.patchEditor({ interestRate: Number(ev.target.value) })}
                    placeholder="0.05"
                  />
                </label>

                <label className="fundAssetsField">
                  <span>Start Date</span>
                  <input
                    type="date"
                    value={e.startDate ?? ""}
                    onChange={(ev) => vm.patchEditor({ startDate: ev.target.value || null })}
                  />
                </label>

                <label className="fundAssetsField">
                  <span>Maturity Date</span>
                  <input
                    type="date"
                    value={e.maturityDate ?? ""}
                    onChange={(ev) => vm.patchEditor({ maturityDate: ev.target.value || null })}
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
          <Button
            variant="primary"
            onClick={vm.saveEditor}
            disabled={vm.loading || !name || !hasAccounts}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
