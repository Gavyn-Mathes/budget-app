// src/renderer/src/components/features/accounts/types/components/AccountTypesHeader.tsx
import React from "react";
import { Button } from "../../../../../components/ui/Button";
import { useAccountTypesPage } from "../hooks/useAccountTypesPage";

export function AccountTypesHeader({ vm }: { vm: ReturnType<typeof useAccountTypesPage> }) {
  return (
    <div className="accountTypesPage__header">
      <div>
        <h1 className="accountTypesPage__title">Account Types</h1>
        <div className="accountTypesPage__subtitle">
          {vm.count} type{vm.count === 1 ? "" : "s"}
        </div>
      </div>

      <Button variant="primary" onClick={vm.openCreate}>
        New Type
      </Button>
    </div>
  );
}
