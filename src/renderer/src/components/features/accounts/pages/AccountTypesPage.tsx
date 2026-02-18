// src/renderer/src/components/features/accounts/pages/AccountTypesPage.tsx
import React from "react";
import { useAccountTypesPage } from "../types/hooks/useAccountTypesPage";
import { AccountTypesHeader } from "../types/components/AccountTypesHeader";
import { AccountTypesTable } from "../types/components/AccountTypesTable";
import { AccountTypesEditorDialog } from "../types/dialogs/AccountTypesEditorDialog";
import { DeleteAccountTypesDialog } from "../types/dialogs/DeleteAccountTypesDialog";
import "../../../../styles/AccountTypesPage.css";
import { Button } from "@/components/ui/Button";
import { useAppNavigate } from "@/components/navigation/useAppNavigate";

type Props = { onNavigate?: (path: string) => void };

export default function AccountTypesPage({ onNavigate }: Props) {
  const go = useAppNavigate(onNavigate);
  const vm = useAccountTypesPage();

  return (
    <div className="accountTypesPage">
      <AccountTypesHeader vm={vm} />

      <div className="accountsPage__actions">
        <Button variant="secondary" onClick={() => go("/accounts")}>
          Back
        </Button>
      </div>
      {vm.error ? <div className="accountTypesPage__error">Error: {vm.error}</div> : null}

      <AccountTypesTable vm={vm} />

      <AccountTypesEditorDialog vm={vm} />
      <DeleteAccountTypesDialog vm={vm} />
    </div>
  );
}
