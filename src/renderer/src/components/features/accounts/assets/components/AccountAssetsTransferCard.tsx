// src/renderer/src/components/features/accounts/assets/components/AccountAssetsTransferCard.tsx
import React, { useMemo } from "react";
import { Button } from "../../../../../components/ui/Button";
import { useAccountAssetsPage } from "../hooks/useAccountAssetsPage";
import type { Asset } from "../../../../../../../shared/types/asset";

export function AccountAssetsTransferCard({ vm }: { vm: ReturnType<typeof useAccountAssetsPage> }) {
  const fromAsset = vm.transferFromAsset;
  const amountLabel =
    fromAsset?.assetType === "STOCK" ? "Quantity (minor units)" : "Amount (minor units)";
  const amountHint =
    fromAsset?.assetType === "STOCK" ? "Example: 250000 for 0.25 shares" : "Example: 2500 for $25.00";

  const assetOptions = useMemo(() => {
    const list = [...vm.assets];
    list.sort((a: Asset, b: Asset) => {
      const an = String(a.name ?? a.assetId).toLowerCase();
      const bn = String(b.name ?? b.assetId).toLowerCase();
      if (an === bn) return String(a.assetId).localeCompare(String(b.assetId));
      return an.localeCompare(bn);
    });
    return list.map((a: Asset) => {
      const accountName = vm.accountNameById.get(a.accountId) ?? a.accountId;
      const label = `${accountName} • ${a.name ?? a.assetId} (${a.assetType})`;
      return { value: a.assetId, label };
    });
  }, [vm.assets, vm.accountNameById]);

  const destinationOptions = useMemo(() => {
    return vm.transferDestinationAssets.map((a: Asset) => ({
      value: a.assetId,
      label: `${a.name ?? a.assetId} (${a.assetType})`,
    }));
  }, [vm.transferDestinationAssets]);

  return (
    <div className="accountAssetsTransfer">
      <div className="accountAssetsTransfer__header">
        <div>
          <div className="accountAssetsTransfer__title">Transfer Between Accounts</div>
          <div className="accountAssetsTransfer__subtitle">
            Moves location only. Fund totals remain unchanged.
          </div>
        </div>

        <Button
          variant="primary"
          onClick={vm.submitTransfer}
          disabled={vm.transferLoading || vm.assets.length === 0}
        >
          {vm.transferLoading ? "Transferring..." : "Transfer"}
        </Button>
      </div>

      {vm.transferError ? (
        <div className="accountAssetsTransfer__error">{vm.transferError}</div>
      ) : null}
      {vm.transferSuccess ? (
        <div className="accountAssetsTransfer__success">{vm.transferSuccess}</div>
      ) : null}

      <div className="accountAssetsTransfer__grid">
        <label className="accountAssetsTransfer__field">
          <div className="accountAssetsTransfer__label">From Asset</div>
          <select
            className="accountAssetsTransfer__input"
            value={vm.transferDraft.fromAssetId}
            onChange={(e) =>
              vm.setTransferDraft((d) => ({
                ...d,
                fromAssetId: e.target.value,
                toAssetId: "",
              }))
            }
          >
            <option value="">Select asset</option>
            {assetOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="accountAssetsTransfer__field">
          <div className="accountAssetsTransfer__label">To Account</div>
          <select
            className="accountAssetsTransfer__input"
            value={vm.transferDraft.toAccountId}
            onChange={(e) =>
              vm.setTransferDraft((d) => ({
                ...d,
                toAccountId: e.target.value,
                toAssetId: "",
              }))
            }
          >
            <option value="">Select account</option>
            {vm.accounts.map((a: any) => (
              <option key={a.accountId} value={a.accountId}>
                {a.accountName ?? a.name ?? a.accountId}
              </option>
            ))}
          </select>
        </label>

        <label className="accountAssetsTransfer__field">
          <div className="accountAssetsTransfer__label">Destination Asset (optional)</div>
          <select
            className="accountAssetsTransfer__input"
            value={vm.transferDraft.toAssetId}
            onChange={(e) => vm.setTransferDraft((d) => ({ ...d, toAssetId: e.target.value }))}
            disabled={!fromAsset || !vm.transferDraft.toAccountId}
          >
            <option value="">Auto (match or create)</option>
            {destinationOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {destinationOptions.length > 1 ? (
            <div className="accountAssetsTransfer__hint">
              Multiple matches found. Select a destination asset.
            </div>
          ) : null}
        </label>

        <label className="accountAssetsTransfer__field">
          <div className="accountAssetsTransfer__label">Event Type</div>
          <select
            className="accountAssetsTransfer__input"
            value={vm.transferDraft.eventTypeId}
            onChange={(e) => vm.setTransferDraft((d) => ({ ...d, eventTypeId: e.target.value }))}
          >
            <option value="">Select event type</option>
            {vm.eventTypes.map((et: any) => (
              <option key={et.eventTypeId} value={et.eventTypeId}>
                {et.eventType ?? et.eventTypeId}
              </option>
            ))}
          </select>
        </label>

        <label className="accountAssetsTransfer__field">
          <div className="accountAssetsTransfer__label">Event Date</div>
          <input
            className="accountAssetsTransfer__input"
            type="date"
            value={vm.transferDraft.eventDate}
            onChange={(e) => vm.setTransferDraft((d) => ({ ...d, eventDate: e.target.value }))}
          />
        </label>

        <label className="accountAssetsTransfer__field">
          <div className="accountAssetsTransfer__label">{amountLabel}</div>
          <input
            className="accountAssetsTransfer__input"
            value={vm.transferDraft.amount}
            onChange={(e) => vm.setTransferDraft((d) => ({ ...d, amount: e.target.value }))}
            placeholder={amountHint}
          />
        </label>

        <label className="accountAssetsTransfer__field">
          <div className="accountAssetsTransfer__label">Unit Price (optional)</div>
          <input
            className="accountAssetsTransfer__input"
            value={vm.transferDraft.unitPrice}
            onChange={(e) => vm.setTransferDraft((d) => ({ ...d, unitPrice: e.target.value }))}
            placeholder="e.g. 187.32"
          />
        </label>

        <label className="accountAssetsTransfer__field">
          <div className="accountAssetsTransfer__label">Fee (minor units)</div>
          <input
            className="accountAssetsTransfer__input"
            value={vm.transferDraft.fee}
            onChange={(e) => vm.setTransferDraft((d) => ({ ...d, fee: e.target.value }))}
            placeholder="0"
          />
        </label>

        <label className="accountAssetsTransfer__field accountAssetsTransfer__field--full">
          <div className="accountAssetsTransfer__label">Event Memo (optional)</div>
          <input
            className="accountAssetsTransfer__input"
            value={vm.transferDraft.memo}
            onChange={(e) => vm.setTransferDraft((d) => ({ ...d, memo: e.target.value }))}
          />
        </label>

        <label className="accountAssetsTransfer__field accountAssetsTransfer__field--full">
          <div className="accountAssetsTransfer__label">Line Notes (optional)</div>
          <textarea
            className="accountAssetsTransfer__input"
            value={vm.transferDraft.notes}
            onChange={(e) => vm.setTransferDraft((d) => ({ ...d, notes: e.target.value }))}
          />
        </label>
      </div>
    </div>
  );
}
