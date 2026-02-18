// src/renderer/src/components/features/funds/components/FundsHeader.tsx
import React from "react";
import { Button } from "../../../ui/Button";
import { useFundsPage } from "../hooks/useFundsPage";

export function FundsHeader({ vm }: { vm: ReturnType<typeof useFundsPage> }) {
  return (
    <div className="funds__header">
      <div>
        <h1 className="funds__title">Funds</h1>
        <div className="funds__subtitle">
          {vm.count} {vm.count === 1 ? "fund" : "funds"}
        </div>
      </div>

      <div className="funds__actions">
        <Button variant="primary" onClick={vm.openCreate} disabled={vm.loading}>
          Add Fund
        </Button>
      </div>
    </div>
  );
}
