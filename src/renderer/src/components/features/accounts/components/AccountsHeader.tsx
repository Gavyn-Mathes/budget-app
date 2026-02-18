// src/renderer/src/components/features/accounts/components/AccountsHeader.tsx
import React from "react";
import { Button } from "../../../ui/Button";
import { useAccountsPage } from "../hooks/useAccountsPage";

export function AccountsHeader({ vm }: { vm: ReturnType<typeof useAccountsPage> }) {
  return (
    <div className="accountsPage__header">
      <div>
        <h1 className="accountsPage__title">Accounts</h1>
        <div className="accountsPage__subtitle">{vm.count} account{vm.count === 1 ? "" : "s"}</div>
      </div>

      <Button variant="primary" onClick={vm.openCreate}>
        New Account
      </Button>
    </div>
  );
}
