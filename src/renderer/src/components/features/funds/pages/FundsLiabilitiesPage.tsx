// src/renderer/src/pages/FundsLiabilitiesPage.tsx
import React from "react";
import { useAppNavigate } from "../../../../components/navigation/useAppNavigate";
import { Button } from "../../../../components/ui/Button";
import { useFundsLiabilitiesPage } from "../liabilities/hooks/useFundsLiabilitiesPage";
import { LiabilitiesTable } from "../liabilities/components/LiabilitiesTable";
import { LiabilityEditorDialog } from "../liabilities/dialogs/LiabilityEditorDialog";
import { DeleteLiabilityDialog } from "../liabilities/dialogs/DeleteLiabilityDialog";
import { LiabilityShowDialog } from "../liabilities/dialogs/LiabilityShowDialog";
import { formatMoney } from "../../../../components/utils/formatMoney";
import "@/styles/FundsLiabilitiesPage.css";

type Props = { onNavigate?: (path: string) => void };

export default function FundsLiabilitiesPage({ onNavigate }: Props) {
  const go = useAppNavigate(onNavigate);
  const vm = useFundsLiabilitiesPage();

  return (
    <div className="fundLiab">
      <div className="fundLiab__header">
        <div>
          <h1 className="fundLiab__title">Liabilities</h1>
          <div className="fundLiab__subtitle">
            All liabilities grouped by fund. Money tracked: {formatMoney(vm.totalBalanceMinor ?? 0)}
          </div>
        </div>

        <div className="fundLiab__actions">
          <Button variant="secondary" onClick={() => go("/funds")}>
            Back
          </Button>
          <Button
            variant="primary"
            onClick={vm.openCreate}
            disabled={vm.loading || vm.funds.length === 0 || vm.accounts.length === 0}
          >
            Add Liability
          </Button>
        </div>
      </div>

      {vm.error ? <div className="fundLiab__error">Error: {vm.error}</div> : null}
      {vm.accounts.length === 0 ? (
        <div className="fundLiab__error">Create at least one account before adding liabilities.</div>
      ) : null}

      <div className="fundLiab__card">
        <LiabilitiesTable vm={vm} />
      </div>

      <LiabilityEditorDialog vm={vm} />
      <DeleteLiabilityDialog vm={vm} />
      <LiabilityShowDialog vm={vm} />
    </div>
  );
}
