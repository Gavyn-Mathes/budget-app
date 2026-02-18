// src/main/services/fund_events.service.ts

import type Database from "better-sqlite3";
import type { FundEvent } from "../../shared/types/fund_event";
import type { Asset, AssetUpsertInput } from "../../shared/types/asset";
import { isCashAsset, isNoteAsset, isStockAsset } from "../../shared/types/asset";
import type { AssetAccountTransferInput } from "../../shared/types/asset_transfer";
import type { FundEventWithLines, FundEventWithLinesUpsertInput } from "../../shared/types/fund_event_line";
import { withTx } from "./common";
import { FundEventRepo } from "../db/repos/fund_events.repo";
import { AssetsRepo } from "../db/repos/assets.repo";

export class FundEventsService {
  constructor(
    private readonly db: Database.Database,
    private readonly repo: FundEventRepo,
    private readonly assetsRepo: AssetsRepo
  ) {}

  listByDateRange(req: { startDate: string; endDate: string }): FundEvent[] {
    return this.repo.listByDateRange(req.startDate, req.endDate);
  }

  getById(eventId: string): FundEventWithLines | null {
    return this.repo.getById(eventId);
  }

  upsert(data: FundEventWithLinesUpsertInput): FundEventWithLines {
    return withTx(this.db, () => this.repo.upsert(data));
  }

  /**
   * Move an asset's location between accounts without changing its fund.
   *
   * Implementation details:
   * - Modeled as a fund_event with two asset lines (negative from source, positive to destination).
   * - Destination asset resolution order:
   *   1) toAssetId (if provided)
   *   2) a single matching asset in the destination account (same fund + instrument)
   *   3) clone the source asset into the destination account
   */
  moveAssetToAccount(input: AssetAccountTransferInput): FundEventWithLines {
    return withTx(this.db, () => {
      const fromAsset = this.assetsRepo.getById(input.fromAssetId);
      if (!fromAsset) {
        throw new Error(`Asset not found: ${input.fromAssetId}`);
      }

      const toAsset = this.resolveDestinationAsset(fromAsset, input);

      if (fromAsset.assetId === toAsset.assetId) {
        throw new Error(`Source and destination assets must differ (assetId=${fromAsset.assetId})`);
      }

      const lineKind = this.requiredLineKind(fromAsset);
      const amount = this.readTransferAmount(input, lineKind);

      const fee = input.fee == null ? null : input.fee;
      if (fee != null && (!Number.isInteger(fee) || fee < 0)) {
        throw new Error(`fee must be a non-negative integer`);
      }

      const unitPrice = input.unitPrice ?? null;
      const notes = input.notes ?? null;

      const lines: FundEventWithLinesUpsertInput["lines"] = [
        lineKind === "ASSET_QUANTITY"
          ? {
              lineKind: "ASSET_QUANTITY",
              assetId: fromAsset.assetId,
              liabilityId: null,
              quantityDeltaMinor: -amount,
              moneyDelta: null,
              unitPrice,
              fee,
              notes,
            }
          : {
              lineKind: "ASSET_MONEY",
              assetId: fromAsset.assetId,
              liabilityId: null,
              quantityDeltaMinor: null,
              moneyDelta: -amount,
              unitPrice,
              fee,
              notes,
            },
        lineKind === "ASSET_QUANTITY"
          ? {
              lineKind: "ASSET_QUANTITY",
              assetId: toAsset.assetId,
              liabilityId: null,
              quantityDeltaMinor: amount,
              moneyDelta: null,
              unitPrice: null,
              fee: null,
              notes,
            }
          : {
              lineKind: "ASSET_MONEY",
              assetId: toAsset.assetId,
              liabilityId: null,
              quantityDeltaMinor: null,
              moneyDelta: amount,
              unitPrice: null,
              fee: null,
              notes,
            },
      ];

      return this.repo.upsert({
        event: input.event,
        lines,
      });
    });
  }

  delete(eventId: string): void {
    return withTx(this.db, () => this.repo.delete(eventId));
  }

  private resolveDestinationAsset(
    fromAsset: Asset,
    input: AssetAccountTransferInput
  ): Asset {
    if (input.toAssetId) {
      const toAsset = this.assetsRepo.getById(input.toAssetId);
      if (!toAsset) {
        throw new Error(`Destination asset not found: ${input.toAssetId}`);
      }
      if (toAsset.accountId !== input.toAccountId) {
        throw new Error(
          `Destination asset account mismatch: asset.accountId=${toAsset.accountId}, toAccountId=${input.toAccountId}`
        );
      }
      if (toAsset.fundId !== fromAsset.fundId) {
        throw new Error(
          `Destination asset fund mismatch: asset.fundId=${toAsset.fundId}, source.fundId=${fromAsset.fundId}`
        );
      }
      if (!this.sameInstrument(fromAsset, toAsset)) {
        throw new Error(`Destination asset must match source instrument`);
      }
      return toAsset;
    }

    const match = this.findMatchingAssetInAccount(fromAsset, input.toAccountId);
    if (match) return match;

    const cloneInput = this.cloneAssetInput(fromAsset, input.toAccountId);
    return this.assetsRepo.upsert(cloneInput);
  }

  private findMatchingAssetInAccount(source: Asset, accountId: string): Asset | null {
    // Note assets are treated as unique; never auto-merge.
    if (source.assetType === "NOTE") return null;

    const candidates = this.assetsRepo
      .listByFundAndAccount(source.fundId, accountId)
      .filter((asset) => this.sameInstrument(source, asset));

    if (candidates.length > 1) {
      throw new Error(
        `Multiple matching assets found in destination account; provide toAssetId explicitly`
      );
    }

    return candidates[0] ?? null;
  }

  private sameInstrument(a: Asset, b: Asset): boolean {
    if (isCashAsset(a) && isCashAsset(b)) {
      return a.currencyCode === b.currencyCode;
    }
    if (isStockAsset(a) && isStockAsset(b)) {
      return a.ticker === b.ticker;
    }
    if (isNoteAsset(a) && isNoteAsset(b)) {
      return (
        a.counterparty === b.counterparty &&
        a.interestRate === b.interestRate &&
        a.startDate === b.startDate &&
        a.maturityDate === b.maturityDate
      );
    }
    return false;
  }

  private cloneAssetInput(source: Asset, accountId: string): AssetUpsertInput {
    const base = {
      fundId: source.fundId,
      accountId,
      name: source.name,
      description: source.description,
    };

    if (isCashAsset(source)) {
      return {
        ...base,
        assetType: "CASH",
        currencyCode: source.currencyCode,
      };
    }

    if (isStockAsset(source)) {
      return {
        ...base,
        assetType: "STOCK",
        ticker: source.ticker,
      };
    }

    if (!isNoteAsset(source)) {
      throw new Error(`Unsupported asset type: ${(source as Asset).assetType}`);
    }

    return {
      ...base,
      assetType: "NOTE",
      counterparty: source.counterparty,
      interestRate: source.interestRate,
      startDate: source.startDate,
      maturityDate: source.maturityDate,
    };
  }

  private requiredLineKind(asset: Asset): "ASSET_QUANTITY" | "ASSET_MONEY" {
    return asset.assetType === "STOCK" ? "ASSET_QUANTITY" : "ASSET_MONEY";
  }

  private readTransferAmount(
    input: AssetAccountTransferInput,
    kind: "ASSET_QUANTITY" | "ASSET_MONEY"
  ): number {
    const amount = kind === "ASSET_QUANTITY" ? input.quantityDeltaMinor : input.moneyDelta;
    if (amount == null || !Number.isInteger(amount) || amount <= 0) {
      const label = kind === "ASSET_QUANTITY" ? "quantityDeltaMinor" : "moneyDelta";
      throw new Error(`${label} must be a positive integer`);
    }
    return amount;
  }
}
