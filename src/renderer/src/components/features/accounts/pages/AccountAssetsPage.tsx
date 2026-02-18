// src/renderer/src/components/features/accounts/assets/pages/AccountAssetsPage.tsx
import React from "react";
import { useAccountAssetsPage } from "../assets/hooks/useAccountAssetsPage";
import { AccountAssetsHeader } from "../assets/components/AccountAssetsHeader";
import { AccountAssetsTable } from "../assets/components/AccountAssetsTable";
import { AccountAssetsTransferCard } from "../assets/components/AccountAssetsTransferCard";
import { Button } from "@/components/ui/Button";
import { useAppNavigate } from "@/components/navigation/useAppNavigate";
import "../../../../styles/AccountsAssetsPage.css";

type Props = { onNavigate?: (path: string) => void };

export default function AccountAssetsPage({ onNavigate }: Props) {
  const go = useAppNavigate(onNavigate);
  const vm = useAccountAssetsPage();

  return (
    <div className="accountAssetsPage">
      <AccountAssetsHeader vm={vm} />
      <div className="accountAssetsPage__actions">
        <Button variant="secondary" onClick={() => go("/accounts")}>
          Back
        </Button>
      </div>

      {vm.error ? <div className="accountAssetsPage__error">Error: {vm.error}</div> : null}

      <div className="accountAssetsPage__filters">
        <label className="accountAssetsPage__field">
          <div className="accountAssetsPage__label">Account</div>
          <select
            className="accountAssetsPage__input"
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

      <AccountAssetsTransferCard vm={vm} />

      <AccountAssetsTable vm={vm} />
    </div>
  );
}
