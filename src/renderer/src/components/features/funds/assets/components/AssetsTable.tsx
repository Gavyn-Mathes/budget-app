// src/renderer/src/components/features/funds/assets/components/AssetsTable.tsx
import React from "react";
import { Button } from "../../../../../components/ui/Button";
import { formatMoney } from "../../../../../components/utils/formatMoney";
import { QTY_SCALE } from "../../../../../../../shared/constants/precision";
import { useFundsAssetsPage } from "../hooks/useFundsAssetsPage";

function formatQuantityMinor(quantityMinor: number): string {
  const qty = quantityMinor / QTY_SCALE;
  return qty.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
}

function balanceText(vm: ReturnType<typeof useFundsAssetsPage>, asset: any): string {
  const defaultCurrency = vm.accountCurrencyById.get(String(asset.accountId ?? "")) ?? "USD";
  const moneyText = formatMoney(asset.moneyBalanceMinor ?? 0, defaultCurrency);
  if (asset.assetType === "STOCK") {
    return `${moneyText} (${formatQuantityMinor(asset.quantityBalanceMinor ?? 0)} shares)`;
  }

  const currency =
    asset.assetType === "CASH"
      ? String(asset.currencyCode ?? "USD")
      : vm.accountCurrencyById.get(String(asset.accountId ?? "")) ?? "USD";

  return formatMoney(asset.moneyBalanceMinor ?? 0, currency);
}

export function AssetsTable({ vm }: { vm: ReturnType<typeof useFundsAssetsPage> }) {
  if (vm.loading) return <div className="fundAssets__muted">Loading...</div>;

  if (vm.grouped.length === 0) {
    return <div className="fundAssets__muted">No assets yet. Add your first asset.</div>;
  }

  return (
    <div className="fundAssets__groups">
      {vm.grouped.map(([fundName, rows]) => {
        const groupMoneyMinor = rows.reduce(
          (sum: number, asset: any) => sum + (asset.moneyBalanceMinor ?? 0),
          0
        );

        return (
          <div key={fundName} className="fundAssets__group">
            <div className="fundAssets__groupHeader">
              <div className="fundAssets__groupTitle">{fundName}</div>
              <div className="fundAssets__groupCount">
                {rows.length} {rows.length === 1 ? "asset" : "assets"} - {formatMoney(groupMoneyMinor)}
              </div>
            </div>

            <table className="fundAssets__table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Fund</th>
                  <th>Account Location</th>
                  <th>Name</th>
                  <th className="fundAssets__num">Balance</th>
                  <th className="fundAssets__right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a: any) => (
                  <tr key={String(a.assetId)}>
                    <td>{String(a.assetType ?? "")}</td>
                    <td>{fundName}</td>
                    <td>
                      {a.accountId
                        ? vm.accountNameById.get(String(a.accountId)) ?? String(a.accountId)
                        : "-"}
                    </td>
                    <td className="fundAssets__name">{String(a.name ?? "")}</td>
                    <td className="fundAssets__num">{balanceText(vm, a)}</td>
                    <td className="fundAssets__right">
                      <Button
                        className="fundAssets__btn"
                        variant="secondary"
                        onClick={() => vm.openShow(a)}
                        disabled={vm.loading}
                      >
                        Show
                      </Button>
                      <Button
                        className="fundAssets__btn"
                        onClick={() => vm.openEdit(a)}
                        disabled={vm.loading}
                      >
                        Edit
                      </Button>
                      <Button
                        className="fundAssets__btn"
                        variant="danger"
                        onClick={() => vm.requestDelete(a)}
                        disabled={vm.loading}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
