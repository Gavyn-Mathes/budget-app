// src/renderer/src/components/features/accounts/pages/AccountsPage.tsx
import React from "react";
import { useAccountsPage } from "../hooks/useAccountsPage";
import { AccountsHeader } from "../components/AccountsHeader";
import { AccountsTable } from "../components/AccountsTable";
import { AccountEditorDialog } from "../dialogs/AccountEditorDialog";
import { DeleteAccountDialog } from "../dialogs/DeleteAccountDialog";
import { Button } from "@/components/ui/Button";
import { useAppNavigate } from "@/components/navigation/useAppNavigate";
import "../../../../styles/AccountsListPage.css";

type Props = { onNavigate?: (path: string) => void };

export default function AccountsListPage({ onNavigate }: Props) {
  const go = useAppNavigate(onNavigate);
  const vm = useAccountsPage();

  return (
    <div className="accountsPage">
      <AccountsHeader vm={vm} />
        <div className="accountsPage__actions">
          <Button variant="secondary" onClick={() => go("/accounts")}>
            Back
          </Button>
        </div>
      {vm.error ? <div className="accountsPage__error">Error: {vm.error}</div> : null}
      {vm.metaError ? <div className="accountsPage__error">Meta: {vm.metaError}</div> : null}

      <AccountsTable vm={vm} />

      <AccountEditorDialog vm={vm} />
      <DeleteAccountDialog vm={vm} />
    </div>
  );
}
