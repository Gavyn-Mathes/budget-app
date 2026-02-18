// src/renderer/src/components/features/funds/pages/FundsListPage.tsx
import React from "react";
import { useFundsPage } from "../hooks/useFundsPage";
import { FundsHeader } from "../components/FundsHeader";
import { FundsTable } from "../components/FundsTable";
import { FundEditorDialog } from "../dialogs/FundEditorDialog";
import { DeleteFundDialog } from "../dialogs/DeleteFundDialog";
import { Button } from "@/components/ui/Button";
import { useAppNavigate } from "@/components/navigation/useAppNavigate";
import "@/styles/FundsListPage.css";

type Props = { onNavigate?: (path: string) => void };

export default function FundsListPage({ onNavigate }: Props) {
  const vm = useFundsPage();
  const go = useAppNavigate(onNavigate);

  return (
    <div className="funds">
      <FundsHeader vm={vm} />
      <div className="FundsPage__actions">
        <Button variant="secondary" onClick={() => go("/funds")}>
          Back
        </Button>
      </div>

      <FundsTable vm={vm} />
      <FundEditorDialog vm={vm} />
      <DeleteFundDialog vm={vm} />
    </div>
  );
}
