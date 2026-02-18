// src/renderer/src/pages/AccountsHomePage.tsx
import React from "react";
import { useAppNavigate } from "@/components/navigation/useAppNavigate";
import { Button } from "@/components/ui/Button";
import { TileButton } from "@/components/ui/TileButton";
import "@/styles/AccountsHomePage.css";

type Props = { onNavigate?: (path: string) => void };

export default function AccountsHomePage({ onNavigate }: Props) {
  const go = useAppNavigate(onNavigate);

  return (
    <div className="accountsHome">
      <div className="accountsHome__header">
        <div>
          <h1 className="accountsHome__title">Accounts</h1>
          <div className="accountsHome__subtitle">
            Manage your accounts and review balances. Link assets and liabilities to the right account.
          </div>
        </div>

        <Button variant="primary" onClick={() => go("/accounts/list")}>
          Open Accounts
        </Button>
      </div>

      <div className="accountsHome__grid">
        <TileButton
          title="Accounts"
          subtitle="View & edit accounts"
          onClick={() => go("/accounts/list")}
        />

        <TileButton
          title="Accounts Types"
          subtitle="Create and edit account types"
          onClick={() => go("/accounts/types")}
        />

        <TileButton
          title="Assets"
          subtitle="View assets by account"
          onClick={() => go("/accounts/assets")}
        />

        <TileButton
          title="Liabilities"
          subtitle="View liabilities by account"
          onClick={() => go("/accounts/liabilities")}
        />

        <TileButton
          title="Account Activity"
          subtitle="Transactions and event history (coming soon)"
          onClick={() => go("/accounts/activity")}
        />
      </div>
    </div>
  );
}
