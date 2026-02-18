// src/main/services/incomes.service.ts

import type Database from "better-sqlite3";
import type {
  Income,
  IncomeMonth,
  IncomeMonthUpsertInput,
  IncomeUpsertInput,
} from "../../shared/types/income";
import type { FundEventWithLinesUpsertInput } from "../../shared/types/fund_event_line";
import { withTx } from "./common";
import { newId } from "../db/mappers/common";
import { IncomeRepo } from "../db/repos/incomes.repo";
import { AssetsRepo } from "../db/repos/assets.repo";
import { AccountsRepo } from "../db/repos/accounts.repo";
import { FundEventRepo } from "../db/repos/fund_events.repo";
import { EventTypesRepo } from "../db/repos/event_types.repo";
import { isValidIsoDate } from "../../shared/constants/month";

export class IncomeService {
  constructor(
    private readonly db: Database.Database,
    private readonly repo: IncomeRepo,
    private readonly assetsRepo: AssetsRepo,
    private readonly accountsRepo: AccountsRepo,
    private readonly fundEventsRepo: FundEventRepo,
    private readonly eventTypesRepo: EventTypesRepo
  ) {}

  listByMonth(incomeMonthKey: string): Income[] {
    return this.repo.listByMonth(incomeMonthKey);
  }

  getMonth(incomeMonthKey: string): IncomeMonth | null {
    return this.repo.getMonth(incomeMonthKey);
  }

  upsertMonth(input: IncomeMonthUpsertInput): IncomeMonth {
    return withTx(this.db, () => this.repo.upsertMonth(input));
  }

  upsert(input: IncomeUpsertInput, expectedMonthKey?: string): Income {
    return withTx(this.db, () => {
      const incomeDateMonthKey = this.monthKeyFromDate(input.date);
      if (incomeDateMonthKey !== input.incomeMonthKey) {
        throw new Error(
          `Income date ${input.date} is not in income month ${input.incomeMonthKey}.`
        );
      }

      const expected = String(expectedMonthKey ?? "").trim();
      if (expected && input.incomeMonthKey !== expected) {
        throw new Error(
          `Income month ${input.incomeMonthKey} does not match selected month ${expected}.`
        );
      }

      const incomeId = input.incomeId?.trim() ? input.incomeId : newId();
      const amount = Number(input.amount ?? 0);
      if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount < 0) {
        throw new Error("Income amount must be a non-negative integer (minor units).");
      }

      const normalized: IncomeUpsertInput = {
        incomeId,
        incomeMonthKey: input.incomeMonthKey,
        name: input.name,
        date: input.date,
        amount: input.amount,
        notes: input.notes ?? null,
      };

      this.repo.ensureIncomeMonthExists(normalized.incomeMonthKey);

      const existingEventId = this.repo.getLinkedFundEventId(incomeId);
      const linkedBudgetMonthKey = this.repo.getLinkedBudgetMonthKey(normalized.incomeMonthKey);
      const linkedEventId = linkedBudgetMonthKey
        ? this.clearIncomePostingForBudgetLinkedMonth(normalized, existingEventId)
        : this.syncFundEventForIncome(normalized, existingEventId);

      return this.repo.upsert(normalized, linkedEventId);
    });
  }

  delete(incomeId: string): void {
    return withTx(this.db, () => {
      const linkedEventId = this.repo.getLinkedFundEventId(incomeId);
      if (linkedEventId) {
        this.fundEventsRepo.delete(linkedEventId);
      }
      this.repo.delete(incomeId);
    });
  }

  private syncFundEventForIncome(
    income: IncomeUpsertInput,
    existingEventId: string | null
  ): string | null {
    const amount = Number(income.amount ?? 0);

    // Keep income row, but do not create a zero-delta accounting event.
    if (amount === 0) {
      if (existingEventId) this.fundEventsRepo.delete(existingEventId);
      return null;
    }

    const incomeId = String(income.incomeId ?? "").trim();
    if (!incomeId) throw new Error("Income ID is required to sync fund event.");

    const destinationAssetId = this.resolveIncomePostingAssetId(income.incomeMonthKey, incomeId);
    const eventTypeId = this.ensureIncomeEventTypeId();

    const payload: FundEventWithLinesUpsertInput = {
      event: {
        eventId: existingEventId ?? undefined,
        eventTypeId,
        eventDate: income.date,
        memo: `Income ${incomeId}`,
      },
      lines: [
        {
          lineKind: "ASSET_MONEY",
          assetId: destinationAssetId,
          liabilityId: null,
          quantityDeltaMinor: null,
          moneyDelta: amount as any,
          unitPrice: null,
          fee: null,
          notes: income.notes ?? null,
        },
      ],
    };

    const created = this.fundEventsRepo.upsert(payload);
    return created.event.eventId;
  }

  private clearIncomePostingForBudgetLinkedMonth(
    income: IncomeUpsertInput,
    existingEventId: string | null
  ): null {
    if (existingEventId) {
      this.fundEventsRepo.delete(existingEventId);
    }

    // Enforce that income_month does not carry posting target when linked to a budget.
    this.repo.upsertMonth({
      incomeMonthKey: income.incomeMonthKey,
      incomeFundId: null,
      incomeAssetId: null,
    });

    return null;
  }

  private ensureIncomeEventTypeId(): string {
    const existing = this.eventTypesRepo.getByName("BUDGET_INCOME");
    if (existing) return existing.eventTypeId;
    return this.eventTypesRepo.create({ eventType: "BUDGET_INCOME" }).eventTypeId;
  }

  private resolveIncomePostingAssetId(incomeMonthKey: string, incomeId: string): string {
    const month = this.repo.getMonth(incomeMonthKey);
    if (!month) {
      throw new Error(
        `Income month ${incomeMonthKey} does not exist. Save the income month header first.`
      );
    }

    return this.resolveIncomeMonthCashAsset(
      month,
      `income_id=${incomeId}, income_month=${incomeMonthKey}`
    );
  }

  private resolveIncomeMonthCashAsset(month: IncomeMonth, ctx: string): string {
    const explicitAssetId = String(month.incomeAssetId ?? "").trim() || null;
    const explicitFundId = String(month.incomeFundId ?? "").trim() || null;

    if (explicitAssetId) {
      const asset = this.assetsRepo.getById(explicitAssetId);
      if (!asset) throw new Error(`Income asset not found: ${explicitAssetId} (${ctx})`);
      if (asset.assetType !== "CASH") {
        throw new Error(`Income asset must be CASH: ${explicitAssetId} (${ctx})`);
      }
      if (explicitFundId && asset.fundId !== explicitFundId) {
        throw new Error(
          `Income asset fund mismatch (${ctx}): asset.fundId=${asset.fundId}, incomeFundId=${explicitFundId}`
        );
      }
      return asset.assetId;
    }

    if (!explicitFundId) {
      throw new Error(
        `Income month ${month.incomeMonthKey} has no income fund/asset configured. Set it in the income month header.`
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
        description: "Auto-created for income posting",
        assetType: "CASH",
        currencyCode,
      });
      return created.assetId;
    }

    throw new Error(
      `Multiple CASH assets found for fund ${explicitFundId}. Set income month incomeAssetId explicitly.`
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
      throw new Error("No accounts exist. Create an account before posting incomes.");
    }

    return {
      accountId: accounts[0].accountId,
      currencyCode: accounts[0].defaultCurrencyCode,
    };
  }

  private monthKeyFromDate(isoDate: string): string {
    const value = String(isoDate ?? "").trim();
    if (!isValidIsoDate(value)) throw new Error(`Invalid income date: ${isoDate}`);
    return value.slice(0, 7);
  }
}
