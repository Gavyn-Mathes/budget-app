// src/renderer/src/components/features/accounts/liabilities/components/AccountLiabilitiesTransferCard.tsx
import React, { useMemo } from "react";
import { Button } from "../../../../../components/ui/Button";
import { useAccountLiabilitiesPage } from "../hooks/useAccountLiabilitiesPage";
import type { Liability } from "../../../../../../../shared/types/liability";

export function AccountLiabilitiesTransferCard({ vm }: { vm: ReturnType<typeof useAccountLiabilitiesPage> }) {
  const liabilityOptions = useMemo(() => {
    const list = [...vm.liabilities];
    list.sort((a: Liability, b: Liability) => {
      const an = String(a.name ?? a.liabilityId).toLowerCase();
      const bn = String(b.name ?? b.liabilityId).toLowerCase();
      if (an === bn) return String(a.liabilityId).localeCompare(String(b.liabilityId));
      return an.localeCompare(bn);
    });
    return list.map((l: Liability) => {
      const accountName = vm.accountNameById.get(l.accountId) ?? l.accountId;
      const label = `${accountName} • ${l.name ?? l.liabilityId} (${l.liabilityType})`;
      return { value: l.liabilityId, label };
    });
  }, [vm.liabilities, vm.accountNameById]);

  return (
    <div className="accountLiabilitiesTransfer">
      <div className="accountLiabilitiesTransfer__header">
        <div>
          <div className="accountLiabilitiesTransfer__title">Move Liability Between Accounts</div>
          <div className="accountLiabilitiesTransfer__subtitle">
            Updates the liability account and records a historical move.
          </div>
        </div>

        <Button
          variant="primary"
          onClick={vm.submitTransfer}
          disabled={vm.transferLoading || vm.liabilities.length === 0}
        >
          {vm.transferLoading ? "Moving..." : "Move"}
        </Button>
      </div>

      {vm.transferError ? (
        <div className="accountLiabilitiesTransfer__error">{vm.transferError}</div>
      ) : null}
      {vm.transferSuccess ? (
        <div className="accountLiabilitiesTransfer__success">{vm.transferSuccess}</div>
      ) : null}

      <div className="accountLiabilitiesTransfer__grid">
        <label className="accountLiabilitiesTransfer__field">
          <div className="accountLiabilitiesTransfer__label">Liability</div>
          <select
            className="accountLiabilitiesTransfer__input"
            value={vm.transferDraft.liabilityId}
            onChange={(e) =>
              vm.setTransferDraft((d) => ({
                ...d,
                liabilityId: e.target.value,
              }))
            }
          >
            <option value="">Select liability</option>
            {liabilityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="accountLiabilitiesTransfer__field">
          <div className="accountLiabilitiesTransfer__label">To Account</div>
          <select
            className="accountLiabilitiesTransfer__input"
            value={vm.transferDraft.toAccountId}
            onChange={(e) =>
              vm.setTransferDraft((d) => ({
                ...d,
                toAccountId: e.target.value,
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

        <label className="accountLiabilitiesTransfer__field">
          <div className="accountLiabilitiesTransfer__label">Event Date</div>
          <input
            className="accountLiabilitiesTransfer__input"
            type="date"
            value={vm.transferDraft.eventDate}
            onChange={(e) => vm.setTransferDraft((d) => ({ ...d, eventDate: e.target.value }))}
          />
        </label>

        <label className="accountLiabilitiesTransfer__field accountLiabilitiesTransfer__field--full">
          <div className="accountLiabilitiesTransfer__label">Memo (optional)</div>
          <input
            className="accountLiabilitiesTransfer__input"
            value={vm.transferDraft.memo}
            onChange={(e) => vm.setTransferDraft((d) => ({ ...d, memo: e.target.value }))}
          />
        </label>
      </div>
    </div>
  );
}
