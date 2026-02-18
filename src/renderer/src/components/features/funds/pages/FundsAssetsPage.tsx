// src/renderer/src/pages/FundsAssetsPage.tsx
// (file) src/renderer/src/pages/FundsAssetsPage.tsx
import React from "react";
import { useAppNavigate } from "../../../../components/navigation/useAppNavigate";
import { Button } from "../../../../components/ui/Button";
import { useFundsAssetsPage } from "../assets/hooks/useFundsAssetsPage";
import { AssetsTable } from "../assets/components/AssetsTable";
import { AssetEditorDialog } from "../assets/dialogs/AssetEditorDialog";
import { DeleteAssetDialog } from "../assets/dialogs/DeleteAssetDialog";
import { AssetShowDialog } from "../assets/dialogs/AssetShowDialog";
import { formatMoney } from "../../../../components/utils/formatMoney";
import "../../../../styles/FundsAssetsPage.css";

type Props = { onNavigate?: (path: string) => void };

export default function FundsAssetsPage({ onNavigate }: Props) {
  const go = useAppNavigate(onNavigate);
  const vm = useFundsAssetsPage();

  return (
    <div className="fundAssets">
      <div className="fundAssets__header">
        <div>
          <h1 className="fundAssets__title">Assets</h1>
          <div className="fundAssets__subtitle">
            All assets grouped by fund. Money tracked: {formatMoney(vm.totalMoneyMinor ?? 0)}
          </div>
        </div>

        <div className="fundAssets__actions">
          <Button variant="secondary" onClick={() => go("/funds")}>
            Back
          </Button>
          <Button
            variant="primary"
            onClick={vm.openCreate}
            disabled={vm.loading || vm.funds.length === 0 || vm.accounts.length === 0}
          >
            Add Asset
          </Button>
        </div>
      </div>

      {vm.error ? <div className="fundAssets__error">Error: {vm.error}</div> : null}
      {vm.accounts.length === 0 ? (
        <div className="fundAssets__error">Create at least one account before adding assets.</div>
      ) : null}

      <div className="fundAssets__card">
        <AssetsTable vm={vm} />
      </div>

      <AssetEditorDialog vm={vm} />
      <DeleteAssetDialog vm={vm} />
      <AssetShowDialog vm={vm} />
    </div>
  );
}
