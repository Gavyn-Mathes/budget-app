// src/main/services/transactions.service.ts

import type Database from "better-sqlite3";
import type { Transaction, TransactionUpsertInput } from "../../shared/types/transaction";
import type { Budget } from "../../shared/types/budget";
import type { FundEventWithLinesUpsertInput } from "../../shared/types/fund_event_line";
import { withTx } from "./common";
import { newId } from "../db/mappers/common";
import { TransactionsRepo } from "../db/repos/transactions.repo";
import { BudgetsRepo } from "../db/repos/budgets.repo";
import { AssetsRepo } from "../db/repos/assets.repo";
import { AccountsRepo } from "../db/repos/accounts.repo";
import { FundEventRepo } from "../db/repos/fund_events.repo";
import { EventTypesRepo } from "../db/repos/event_types.repo";
import { isValidIsoDate } from "../../shared/constants/month";

export class TransactionsService {
  constructor(
    private readonly db: Database.Database,
    private readonly repo: TransactionsRepo,
    private readonly budgetsRepo: BudgetsRepo,
    private readonly assetsRepo: AssetsRepo,
    private readonly accountsRepo: AccountsRepo,
    private readonly fundEventsRepo: FundEventRepo,
    private readonly eventTypesRepo: EventTypesRepo
  ) {}

  listByMonth(monthKey: string): Transaction[] {
    return this.repo.listByMonth(monthKey);
  }

  upsert(input: TransactionUpsertInput, expectedMonthKey?: string): Transaction {
    return withTx(this.db, () => {
      const actualMonthKey = this.monthKeyFromDate(input.date);
      const expected = String(expectedMonthKey ?? "").trim();
      if (expected && actualMonthKey !== expected) {
        throw new Error(
          `Transaction date ${input.date} is not in selected month ${expected}.`
        );
      }

      const transactionId = input.transactionId?.trim() ? input.transactionId : newId();
      const txInput: TransactionUpsertInput = {
        transactionId,
        categoryId: input.categoryId,
        date: input.date,
        amount: input.amount,
        notes: input.notes ?? null,
      };

      const existingEventId = this.repo.getLinkedFundEventId(transactionId);
      const linkedEventId = this.syncFundEventForTransaction(txInput, existingEventId);

      return this.repo.upsert(txInput, linkedEventId);
    });
  }

  delete(transactionId: string): void {
    return withTx(this.db, () => {
      const linkedEventId = this.repo.getLinkedFundEventId(transactionId);
      if (linkedEventId) {
        this.fundEventsRepo.delete(linkedEventId);
      }
      this.repo.delete(transactionId);
    });
  }

  private syncFundEventForTransaction(
    tx: TransactionUpsertInput,
    existingEventId: string | null
  ): string | null {
    const amount = Number(tx.amount ?? 0);
    if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount < 0) {
      throw new Error("Transaction amount must be a non-negative integer (minor units).");
    }

    // Keep transaction, but do not create a zero-delta accounting event.
    if (amount === 0) {
      if (existingEventId) this.fundEventsRepo.delete(existingEventId);
      return null;
    }

    const transactionId = String(tx.transactionId ?? "").trim();
    if (!transactionId) throw new Error("Transaction ID is required to sync fund event.");

    const sourceAssetId = this.resolveBudgetSpendingAssetId(tx.date, transactionId);
    const eventTypeId = this.ensureTransactionEventTypeId();

    const payload: FundEventWithLinesUpsertInput = {
      event: {
        eventId: existingEventId ?? undefined,
        eventTypeId,
        eventDate: tx.date,
        memo: `Budget transaction ${transactionId}`,
      },
      lines: [
        {
          lineKind: "ASSET_MONEY",
          assetId: sourceAssetId,
          liabilityId: null,
          quantityDeltaMinor: null,
          moneyDelta: -amount as any,
          unitPrice: null,
          fee: null,
          notes: tx.notes ?? null,
        },
      ],
    };

    const created = this.fundEventsRepo.upsert(payload);
    return created.event.eventId;
  }

  private ensureTransactionEventTypeId(): string {
    const existing = this.eventTypesRepo.getByName("BUDGET_TRANSACTION");
    if (existing) return existing.eventTypeId;
    return this.eventTypesRepo.create({ eventType: "BUDGET_TRANSACTION" }).eventTypeId;
  }

  private resolveBudgetSpendingAssetId(txDate: string, transactionId: string): string {
    const monthKey = this.monthKeyFromDate(txDate);
    const budget = this.budgetsRepo.getByMonth(monthKey);
    if (!budget) {
      throw new Error(
        `No budget found for ${monthKey}. Create that budget and set a spending fund/asset for transaction posting.`
      );
    }

    return this.resolveBudgetCashAsset(
      budget,
      `transaction_id=${transactionId}, budget_month=${monthKey}`
    );
  }

  private resolveBudgetCashAsset(budget: Budget, ctx: string): string {
    const explicitAssetId = String(budget.spendingAssetId ?? "").trim() || null;
    const explicitFundId = String(budget.spendingFundId ?? "").trim() || null;

    if (explicitAssetId) {
      const asset = this.assetsRepo.getById(explicitAssetId);
      if (!asset) throw new Error(`Spending asset not found: ${explicitAssetId} (${ctx})`);
      if (asset.assetType !== "CASH") {
        throw new Error(`Spending asset must be CASH: ${explicitAssetId} (${ctx})`);
      }
      if (explicitFundId && asset.fundId !== explicitFundId) {
        throw new Error(
          `Spending asset fund mismatch (${ctx}): asset.fundId=${asset.fundId}, spendingFundId=${explicitFundId}`
        );
      }
      return asset.assetId;
    }

    if (!explicitFundId) {
      throw new Error(
        `Budget ${budget.budgetMonthKey} has no spending fund/asset configured. Set one to auto-post transactions.`
      );
    }

    const cashAssets = this.assetsRepo
      .listByFund(explicitFundId)
      .filter((a) => a.assetType === "CASH");

    if (cashAssets.length === 1) return cashAssets[0].assetId;

    if (cashAssets.length === 0) {
      const { accountId, currencyCode } = this.pickAccountForFund(explicitFundId);
      const created = this.assetsRepo.upsert({
        fundId: explicitFundId,
        accountId,
        name: `Auto Cash (${currencyCode})`,
        description: "Auto-created for transaction posting",
        assetType: "CASH",
        currencyCode,
      });
      return created.assetId;
    }

    throw new Error(
      `Multiple CASH assets found for fund ${explicitFundId}. Set budget.spendingAssetId explicitly.`
    );
  }

  private pickAccountForFund(fundId: string): { accountId: string; currencyCode: string } {
    const fundAssets = this.assetsRepo.listByFund(fundId);
    if (fundAssets.length > 0) {
      const accountId = fundAssets[0].accountId;
      const account = this.accountsRepo.getById(accountId);
      return {
        accountId,
        currencyCode: account?.defaultCurrencyCode ?? "USD",
      };
    }

    const accounts = this.accountsRepo.list();
    if (accounts.length === 0) {
      throw new Error("No accounts exist. Create an account before posting transactions.");
    }

    return {
      accountId: accounts[0].accountId,
      currencyCode: accounts[0].defaultCurrencyCode,
    };
  }

  private monthKeyFromDate(isoDate: string): string {
    const value = String(isoDate ?? "").trim();
    if (!isValidIsoDate(value)) throw new Error(`Invalid transaction date: ${isoDate}`);
    return value.slice(0, 7);
  }
}
