// src/renderer/src/components/features/accounts/liabilities/components/AccountLiabilitiesHeader.tsx
import React from "react";
import { Button } from "../../../../../components/ui/Button";
import { formatMoney } from "../../../../../components/utils/formatMoney";
import { useAccountLiabilitiesPage } from "../hooks/useAccountLiabilitiesPage";

export function AccountLiabilitiesHeader({ vm }: { vm: ReturnType<typeof useAccountLiabilitiesPage> }) {
  const count = vm.accountId === "__ALL__" ? vm.liabilities.length : vm.filteredLiabilities.length;
  const accountLabel =
    vm.accountId === "__ALL__" ? "All accounts" : vm.accountNameById.get(vm.accountId) ?? "Account";

  const subtitle =
    vm.accountId === "__ALL__"
      ? `${accountLabel} - ${count} liabilit${count === 1 ? "y" : "ies"}`
      : `${accountLabel} - ${count} liabilit${count === 1 ? "y" : "ies"} - ${formatMoney(
          vm.filteredBalanceMinor,
          vm.selectedAccountCurrencyCode
        )}`;

  return (
    <div className="accountLiabilitiesPage__header">
      <div>
        <h1 className="accountLiabilitiesPage__title">Liabilities by Account</h1>
        <div className="accountLiabilitiesPage__subtitle">{subtitle}</div>
      </div>

      <Button variant="ghost" onClick={vm.refresh} disabled={vm.loading}>
        {vm.loading ? "Refreshing..." : "Refresh"}
      </Button>
    </div>
  );
}
