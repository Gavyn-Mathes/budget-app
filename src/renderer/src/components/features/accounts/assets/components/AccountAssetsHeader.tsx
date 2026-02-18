// src/renderer/src/components/features/accounts/assets/components/AccountAssetsHeader.tsx
import React from "react";
import { Button } from "../../../../../components/ui/Button";
import { formatMoney } from "../../../../../components/utils/formatMoney";
import { useAccountAssetsPage } from "../hooks/useAccountAssetsPage";

export function AccountAssetsHeader({ vm }: { vm: ReturnType<typeof useAccountAssetsPage> }) {
  const count = vm.accountId === "__ALL__" ? vm.assets.length : vm.filteredAssets.length;
  const accountLabel =
    vm.accountId === "__ALL__" ? "All accounts" : vm.accountNameById.get(vm.accountId) ?? "Account";

  const subtitle =
    vm.accountId === "__ALL__"
      ? `${accountLabel} - ${count} asset${count === 1 ? "" : "s"}`
      : `${accountLabel} - ${count} asset${count === 1 ? "" : "s"} - ${formatMoney(
          vm.filteredMoneyBalanceMinor,
          vm.selectedAccountCurrencyCode
        )}`;

  return (
    <div className="accountAssetsPage__header">
      <div>
        <h1 className="accountAssetsPage__title">Assets by Account</h1>
        <div className="accountAssetsPage__subtitle">{subtitle}</div>
      </div>

      <Button variant="ghost" onClick={vm.refresh} disabled={vm.loading}>
        {vm.loading ? "Refreshing..." : "Refresh"}
      </Button>
    </div>
  );
}
