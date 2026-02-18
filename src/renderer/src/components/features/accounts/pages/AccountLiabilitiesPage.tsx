// src/renderer/src/components/features/accounts/pages/AccountLiabilitiesPage.tsx
import React from "react";
import { useAccountLiabilitiesPage } from "../liabilities/hooks/useAccountLiabilitiesPage";
import { AccountLiabilitiesHeader } from "../liabilities/components/AccountLiabilitiesHeader";
import { AccountLiabilitiesTable } from "../liabilities/components/AccountLiabilitiesTable";
import { AccountLiabilitiesTransferCard } from "../liabilities/components/AccountLiabilitiesTransferCard";
import { useAppNavigate } from "@/components/navigation/useAppNavigate";
import { Button } from "@/components/ui/Button";
import "../../../../styles/AccountsLiabilitiesPage.css";

type Props = { onNavigate?: (path: string) => void };

export default function AccountLiabilitiesPage({ onNavigate }: Props) {
  const go = useAppNavigate(onNavigate);
  const vm = useAccountLiabilitiesPage();

  return (
    <div className="accountLiabilitiesPage">
      <AccountLiabilitiesHeader vm={vm} />
      <div className="accountLiabilitiesPage__actions">
        <Button variant="secondary" onClick={() => go("/accounts")}>
          Back
        </Button>
      </div>

      {vm.error ? <div className="accountLiabilitiesPage__error">Error: {vm.error}</div> : null}

      <div className="accountLiabilitiesPage__filters">
        <label className="accountLiabilitiesPage__field">
          <div className="accountLiabilitiesPage__label">Account</div>
          <select
            className="accountLiabilitiesPage__input"
            value={vm.accountId}
            onChange={(e) => vm.setAccountId(e.target.value)}
          >
            <option value="__ALL__">All accounts</option>

            {vm.accounts.map((a: any) => (
              <option key={a.accountId} value={a.accountId}>
                {a.accountName ?? a.name ?? a.accountId}
              </option>
            ))}
          </select>
        </label>
      </div>

      <AccountLiabilitiesTransferCard vm={vm} />

      <AccountLiabilitiesTable vm={vm} />
    </div>
  );
}
