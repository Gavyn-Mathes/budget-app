// src/renderer/src/components/features/accounts/assets/components/AccountAssetsTable.tsx
import React from "react";
import { formatMoney } from "../../../../../components/utils/formatMoney";
import { QTY_SCALE } from "../../../../../../../shared/constants/precision";
import { useAccountAssetsPage } from "../hooks/useAccountAssetsPage";

function formatQuantityMinor(quantityMinor: number): string {
  const qty = quantityMinor / QTY_SCALE;
  return qty.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
}

function formatAssetBalance(asset: any, accountCurrencyById: Map<string, string>): string {
  if (asset.assetType === "STOCK") {
    return `${formatQuantityMinor(asset.quantityBalanceMinor ?? 0)} shares`;
  }

  const currency =
    asset.assetType === "CASH"
      ? asset.currencyCode
      : accountCurrencyById.get(asset.accountId) ?? "USD";

  return formatMoney(asset.moneyBalanceMinor ?? 0, currency);
}

export function AccountAssetsTable({ vm }: { vm: ReturnType<typeof useAccountAssetsPage> }) {
  if (vm.loading) {
    return <div className="accountAssetsPage__muted">Loading...</div>;
  }

  if (vm.accountId === "__ALL__") {
    return (
      <div className="accountAssetsPage__groups">
        {vm.grouped.length === 0 ? (
          <div className="accountAssetsPage__muted">No assets yet.</div>
        ) : (
          vm.grouped.map((g) => (
            <div key={g.accountId} className="accountAssetsPage__group">
              <div className="accountAssetsPage__groupHeader">
                <div className="accountAssetsPage__groupTitle">{g.accountName}</div>
                <div className="accountAssetsPage__muted">
                  {g.assets.length} asset{g.assets.length === 1 ? "" : "s"} -{" "}
                  {formatMoney(g.moneyBalanceMinor ?? 0, g.currencyCode)}
                </div>
              </div>

              <div className="accountAssetsPage__tableWrap">
                <table className="accountAssetsPage__table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th className="accountAssetsPage__num">Balance</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.assets.map((a: any) => (
                      <tr key={a.assetId}>
                        <td>{a.assetName ?? a.name ?? a.assetId}</td>
                        <td>{a.assetKind ?? a.assetType ?? a.subtype ?? "--"}</td>
                        <td className="accountAssetsPage__num">
                          {formatAssetBalance(a, vm.accountCurrencyById)}
                        </td>
                        <td className="accountAssetsPage__notes">{a.notes ?? ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="accountAssetsPage__tableWrap">
      <table className="accountAssetsPage__table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th className="accountAssetsPage__num">Balance</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {vm.filteredAssets.length === 0 ? (
            <tr>
              <td colSpan={4} className="accountAssetsPage__muted">
                No assets for this account.
              </td>
            </tr>
          ) : (
            vm.filteredAssets.map((a: any) => (
              <tr key={a.assetId}>
                <td>{a.assetName ?? a.name ?? a.assetId}</td>
                <td>{a.assetKind ?? a.assetType ?? a.subtype ?? "--"}</td>
                <td className="accountAssetsPage__num">
                  {formatAssetBalance(a, vm.accountCurrencyById)}
                </td>
                <td className="accountAssetsPage__notes">{a.notes ?? ""}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
