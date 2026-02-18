// src/main/services/budgets.service.ts

import type Database from "better-sqlite3";
import type { Budget, BudgetUpsertInput } from "../../shared/types/budget";
import type { BudgetLineUpsertInput } from "../../shared/types/budget_line";
import type { FundEventWithLinesUpsertInput } from "../../shared/types/fund_event_line";
import type { Asset } from "../../shared/types/asset";
import { distributionPlannedAmount } from "../../shared/domain/distribution";
import { computeBudgetAllocationPlan } from "../../shared/domain/budget_line";
import { spentByCategory } from "../../shared/domain/transaction";
import { nextMonthKey } from "../../shared/domain/month";
import { withTx } from "./common";
import { BudgetsRepo } from "../db/repos/budgets.repo";
import { BudgetLinesRepo } from "../db/repos/budget_lines.repo";
import { DistributionRepo } from "../db/repos/distributions.repo";
import { TransactionsRepo } from "../db/repos/transactions.repo";
import { IncomeRepo } from "../db/repos/incomes.repo";
import { AssetsRepo } from "../db/repos/assets.repo";
import { AccountsRepo } from "../db/repos/accounts.repo";
import { FundEventRepo } from "../db/repos/fund_events.repo";
import { EventTypesRepo } from "../db/repos/event_types.repo";

export class BudgetsService {
  constructor(
    private readonly db: Database.Database,
    private readonly repo: BudgetsRepo,
    private readonly linesRepo: BudgetLinesRepo,
    private readonly distributionsRepo: DistributionRepo,
    private readonly transactionsRepo: TransactionsRepo,
    private readonly incomesRepo: IncomeRepo,
    private readonly assetsRepo: AssetsRepo,
    private readonly accountsRepo: AccountsRepo,
    private readonly fundEventsRepo: FundEventRepo,
    private readonly eventTypesRepo: EventTypesRepo
  ) {}

  // matches "GetByMonth" -> "getByMonth"
  getByMonth(budgetMonthKey: string): Budget | null {
    return this.repo.getByMonth(budgetMonthKey);
  }

  // matches "Upsert" -> "upsert"
  upsert(input: BudgetUpsertInput): Budget {
    return withTx(this.db, () => {
      this.assertOverageConfigured({
        budgetMonthKey: input.budgetMonthKey,
        overageFundId: input.overageFundId ?? null,
        overageAssetId: input.overageAssetId ?? null,
      });

      const budget = this.repo.upsert(input);

      // Enforce that category allocations stay within the allocation pool.
      const budgetLines = this.linesRepo.listByBudget(budget.budgetId);
      const incomes = this.incomesRepo.listByMonth(budget.incomeMonthKey);
      let totalIncome = 0;
      for (const inc of incomes) totalIncome += Number(inc.amount ?? 0);
      const allocationPlan = computeBudgetAllocationPlan(budgetLines, totalIncome, budget.cap);
      if (allocationPlan.overAllocated) {
        const overBy = Math.abs(allocationPlan.remainingMinor);
        throw new Error(
          `Category allocations exceed available budget pool by ${overBy} minor units.`
        );
      }

      this.detachIncomePostingForLinkedMonth(budget.incomeMonthKey);
      return budget;
    });
  }

  list(): Budget[] {
    return this.repo.list();
  }

  applyDistributions(req: {
    budgetMonthKey: string;
    mode?: "SURPLUS" | "LEFTOVERS" | "ALL";
    force?: boolean;
  }): { budget: Budget; createdEventIds: string[] } {
    return withTx(this.db, () => {
      const mode = req.mode ?? "ALL";
      const force = req.force ?? false;

      const budget = this.repo.getByMonth(req.budgetMonthKey);
      if (!budget) throw new Error(`Budget not found for month ${req.budgetMonthKey}`);

      const rules = this.distributionsRepo.listByBudget(budget.budgetId);
      const categoryRules = rules.filter((r) => r.sourceType === "CATEGORY");
      const surplusRules = rules.filter((r) => r.sourceType === "SURPLUS");

      if (categoryRules.some((rule) => rule.allocationType !== "PERCENT")) {
        throw new Error(
          "CATEGORY distribution rules must use PERCENT allocation. Update fixed category rules first."
        );
      }

      const wantSurplus = mode === "ALL" || mode === "SURPLUS";
      const wantLeftovers = mode === "ALL" || mode === "LEFTOVERS";

      if (wantLeftovers) {
        this.assertOverageConfigured({
          budgetMonthKey: budget.budgetMonthKey,
          overageFundId: budget.overageFundId ?? null,
          overageAssetId: budget.overageAssetId ?? null,
        });
      }

      const transactions = this.transactionsRepo.listByMonth(budget.budgetMonthKey);
      const spentMap = spentByCategory(transactions);
      let totalSpent = 0;
      for (const k of Object.keys(spentMap)) totalSpent += spentMap[k];

      const incomes = this.incomesRepo.listByMonth(budget.incomeMonthKey);
      let totalIncome = 0;
      for (const inc of incomes) totalIncome += inc.amount as any as number;

      const budgetLines = this.linesRepo.listByBudget(budget.budgetId);
      const allocationPlan = computeBudgetAllocationPlan(
        budgetLines,
        totalIncome,
        budget.cap
      );
      const plannedByCategory = allocationPlan.plannedByCategory;
      const plannedTotal = allocationPlan.plannedTotalMinor;
      const surplusBase = Math.max(0, totalIncome - allocationPlan.spendablePoolMinor);

      // A mode is only considered runnable when it has configuration.
      // This prevents new budgets from being marked as "handled" before rules exist.
      const surplusConfigured = surplusRules.length > 0;
      const leftoversConfigured =
        categoryRules.length > 0 ||
        String(budget.overageFundId ?? "").trim().length > 0 ||
        String(budget.overageAssetId ?? "").trim().length > 0;

      const runSurplus =
        wantSurplus &&
        (force || !budget.surplusHandled) &&
        surplusConfigured &&
        surplusBase > 0;
      const runLeftovers =
        wantLeftovers && (force || !budget.leftoversHandled) && leftoversConfigured;

      if (!runSurplus && !runLeftovers) {
        return { budget, createdEventIds: [] };
      }

      const createdEventIds: string[] = [];
      const eventDate = this.lastDateOfMonth(budget.budgetMonthKey);

      let eventTypeId: string | null = null;
      const ensureEventTypeId = () => {
        if (eventTypeId) return eventTypeId;
        const existing = this.eventTypesRepo.getByName("BUDGET_DISTRIBUTION");
        eventTypeId = existing
          ? existing.eventTypeId
          : this.eventTypesRepo.create({ eventType: "BUDGET_DISTRIBUTION" }).eventTypeId;
        return eventTypeId;
      };

      const cashAssetsByFund = new Map<string, Asset[]>();
      const getCashAssets = (fundId: string) => {
        if (cashAssetsByFund.has(fundId)) return cashAssetsByFund.get(fundId)!;
        const assets = this.assetsRepo.listByFund(fundId).filter((a) => a.assetType === "CASH");
        cashAssetsByFund.set(fundId, assets);
        return assets;
      };

      const resolveCashAssetId = (
        fundId: string | null | undefined,
        assetId: string | null | undefined,
        ctx: string
      ) => {
        const fid = String(fundId ?? "").trim();
        if (!fid) throw new Error(`Missing fundId for ${ctx}`);

        if (assetId) {
          const asset = this.assetsRepo.getById(assetId);
          if (!asset) throw new Error(`Asset not found: ${assetId} (${ctx})`);
          if (asset.fundId !== fid) {
            throw new Error(`Asset fund mismatch for ${ctx}: asset.fundId=${asset.fundId}, fundId=${fid}`);
          }
          if (asset.assetType !== "CASH") {
            throw new Error(`Asset must be CASH for ${ctx} (assetId=${asset.assetId})`);
          }
          return asset.assetId;
        }

        const cashAssets = getCashAssets(fid);
        if (cashAssets.length === 1) return cashAssets[0].assetId;
        if (cashAssets.length === 0) {
          const { accountId, currencyCode } = this.pickAccountForFund(fid);
          const created = this.assetsRepo.upsert({
            fundId: fid,
            accountId,
            name: `Auto Cash (${currencyCode})`,
            description: "Auto-created for budget distributions",
            assetType: "CASH",
            currencyCode,
          });
          cashAssetsByFund.set(fid, [created]);
          return created.assetId;
        }
        throw new Error(`Multiple CASH assets for fund ${fid}; set assetId for ${ctx}`);
      };

      if (runSurplus) {
        const lines: FundEventWithLinesUpsertInput["lines"] = [];
        const staged: Array<{ rule: (typeof surplusRules)[number]; amount: number }> = [];
        let requested = 0;

        for (const rule of surplusRules) {
          const amount = Math.round(distributionPlannedAmount(rule, surplusBase));
          if (!Number.isFinite(amount) || amount <= 0) continue;
          requested += amount;
          staged.push({ rule, amount });
        }

        if (requested > surplusBase) {
          throw new Error(
            `Distribution rules exceed available surplus by ${requested - surplusBase} minor units.`
          );
        }

        for (const { rule, amount } of staged) {
          const assetId = resolveCashAssetId(
            rule.fundId,
            rule.assetId ?? null,
            `distribution_rule_id=${rule.distributionRuleId}`
          );
          lines.push({
            lineKind: "ASSET_MONEY",
            assetId,
            liabilityId: null,
            quantityDeltaMinor: null,
            moneyDelta: amount as any,
            unitPrice: null,
            fee: null,
            notes: `Budget surplus ${budget.budgetMonthKey}`,
          });
        }

        if (lines.length > 0) {
          const eventTypeIdFinal = ensureEventTypeId();
          const payload: FundEventWithLinesUpsertInput = {
            event: {
              eventTypeId: eventTypeIdFinal,
              eventDate,
              memo: `Budget surplus ${budget.budgetMonthKey}`,
            },
            lines,
          };
          const created = this.fundEventsRepo.upsert(payload);
          createdEventIds.push(created.event.eventId);
        }
      }

      if (runLeftovers) {
        const lines: FundEventWithLinesUpsertInput["lines"] = [];
        const rulesByCategory = new Map<string, typeof categoryRules>();
        for (const rule of categoryRules) {
          const categoryId = String(rule.categoryId ?? "").trim();
          if (!categoryId) continue;
          if (!rulesByCategory.has(categoryId)) rulesByCategory.set(categoryId, []);
          rulesByCategory.get(categoryId)!.push(rule);
        }

        for (const [categoryId, rulesForCategory] of rulesByCategory.entries()) {
          const planned = plannedByCategory.get(categoryId) ?? 0;
          const spent = spentMap[categoryId] ?? 0;
          const remaining = planned - spent;
          if (remaining <= 0) continue;

          const staged: Array<{ rule: (typeof categoryRules)[number]; amount: number }> = [];
          let requested = 0;

          for (const rule of rulesForCategory) {
            const amount = Math.round(distributionPlannedAmount(rule, remaining));
            if (!Number.isFinite(amount) || amount <= 0) continue;
            requested += amount;
            staged.push({ rule, amount });
          }

          if (requested > remaining) {
            throw new Error(
              `Distribution rules exceed available leftover for category ${categoryId} by ${
                requested - remaining
              } minor units.`
            );
          }

          for (const { rule, amount } of staged) {
            const assetId = resolveCashAssetId(
              rule.fundId,
              rule.assetId ?? null,
              `distribution_rule_id=${rule.distributionRuleId}`
            );
            lines.push({
              lineKind: "ASSET_MONEY",
              assetId,
              liabilityId: null,
              quantityDeltaMinor: null,
              moneyDelta: amount as any,
              unitPrice: null,
              fee: null,
              notes: `Budget leftovers ${budget.budgetMonthKey}`,
            });
          }
        }

        const overspend = totalSpent - plannedTotal;
        if (overspend > 0) {
          const assetId = resolveCashAssetId(
            budget.overageFundId ?? null,
            budget.overageAssetId ?? null,
            `budget overage ${budget.budgetMonthKey}`
          );
          lines.push({
            lineKind: "ASSET_MONEY",
            assetId,
            liabilityId: null,
            quantityDeltaMinor: null,
            moneyDelta: -overspend as any,
            unitPrice: null,
            fee: null,
            notes: `Budget overage ${budget.budgetMonthKey}`,
          });
        }

        if (lines.length > 0) {
          const eventTypeIdFinal = ensureEventTypeId();
          const payload: FundEventWithLinesUpsertInput = {
            event: {
              eventTypeId: eventTypeIdFinal,
              eventDate,
              memo: `Budget leftovers ${budget.budgetMonthKey}`,
            },
            lines,
          };
          const created = this.fundEventsRepo.upsert(payload);
          createdEventIds.push(created.event.eventId);
        }
      }

      const nextBudget: Budget = {
        ...budget,
        surplusHandled: runSurplus ? true : budget.surplusHandled,
        leftoversHandled: runLeftovers ? true : budget.leftoversHandled,
      };

      const needsUpdate =
        nextBudget.surplusHandled !== budget.surplusHandled ||
        nextBudget.leftoversHandled !== budget.leftoversHandled;

      const updated = needsUpdate
        ? this.repo.upsert({
            budgetId: nextBudget.budgetId,
            budgetMonthKey: nextBudget.budgetMonthKey,
            incomeMonthKey: nextBudget.incomeMonthKey,
            cap: nextBudget.cap,
            notes: nextBudget.notes ?? null,
            spendingFundId: nextBudget.spendingFundId ?? null,
            spendingAssetId: nextBudget.spendingAssetId ?? null,
            overageFundId: nextBudget.overageFundId ?? null,
            overageAssetId: nextBudget.overageAssetId ?? null,
            surplusHandled: nextBudget.surplusHandled,
            leftoversHandled: nextBudget.leftoversHandled,
          })
        : budget;

      return { budget: updated, createdEventIds };
    });
  }

  undoDistributions(req: {
    budgetMonthKey: string;
    mode?: "SURPLUS" | "LEFTOVERS" | "ALL";
  }): { budget: Budget; deletedEventIds: string[] } {
    return withTx(this.db, () => {
      const mode = req.mode ?? "ALL";
      const budget = this.repo.getByMonth(req.budgetMonthKey);
      if (!budget) throw new Error(`Budget not found for month ${req.budgetMonthKey}`);

      const targetMemos: string[] = [];
      if (mode === "ALL" || mode === "SURPLUS") {
        targetMemos.push(`Budget surplus ${budget.budgetMonthKey}`);
      }
      if (mode === "ALL" || mode === "LEFTOVERS") {
        targetMemos.push(`Budget leftovers ${budget.budgetMonthKey}`);
      }

      const deletedIds = new Set<string>();
      const distType = this.eventTypesRepo.getByName("BUDGET_DISTRIBUTION");
      if (distType && targetMemos.length > 0) {
        for (const memo of targetMemos) {
          const ids = this.fundEventsRepo.listEventIdsByTypeAndMemo(distType.eventTypeId, memo);
          for (const id of ids) deletedIds.add(id);
        }
        for (const id of deletedIds) {
          this.fundEventsRepo.delete(id);
        }
      }

      const nextBudget: Budget = {
        ...budget,
        surplusHandled:
          mode === "ALL" || mode === "SURPLUS" ? false : budget.surplusHandled,
        leftoversHandled:
          mode === "ALL" || mode === "LEFTOVERS" ? false : budget.leftoversHandled,
      };

      const needsUpdate =
        nextBudget.surplusHandled !== budget.surplusHandled ||
        nextBudget.leftoversHandled !== budget.leftoversHandled;

      const updated = needsUpdate
        ? this.repo.upsert({
            budgetId: nextBudget.budgetId,
            budgetMonthKey: nextBudget.budgetMonthKey,
            incomeMonthKey: nextBudget.incomeMonthKey,
            cap: nextBudget.cap,
            notes: nextBudget.notes ?? null,
            spendingFundId: nextBudget.spendingFundId ?? null,
            spendingAssetId: nextBudget.spendingAssetId ?? null,
            overageFundId: nextBudget.overageFundId ?? null,
            overageAssetId: nextBudget.overageAssetId ?? null,
            surplusHandled: nextBudget.surplusHandled,
            leftoversHandled: nextBudget.leftoversHandled,
          })
        : budget;

      return { budget: updated, deletedEventIds: [...deletedIds] };
    });
  }

  transferIncomeToSpending(req: {
    budgetMonthKey: string;
    incomeFundId?: string | null;
    incomeAssetId?: string | null;
    amountMinor?: number | null;
  }): {
    budget: Budget;
    eventId: string;
    amountMinor: number;
    sourceAssetId: string;
    destinationAssetId: string;
  } {
    return withTx(this.db, () => {
      const budget = this.repo.getByMonth(req.budgetMonthKey);
      if (!budget) throw new Error(`Budget not found for month ${req.budgetMonthKey}`);

      const destinationAssetId = this.resolveBudgetSpendingCashAssetId(
        budget,
        `budget_month=${budget.budgetMonthKey}`
      );

      const sourceAssetId = this.resolveIncomeSourceCashAssetId(
        budget,
        {
          incomeFundId: req.incomeFundId ?? null,
          incomeAssetId: req.incomeAssetId ?? null,
        },
        destinationAssetId
      );

      if (sourceAssetId === destinationAssetId) {
        throw new Error("Income source asset and budget spending asset must differ.");
      }

      const fallbackAmount = this.totalIncomeForMonth(budget.incomeMonthKey);
      const amountMinor = Number(req.amountMinor ?? fallbackAmount);
      if (!Number.isFinite(amountMinor) || !Number.isInteger(amountMinor) || amountMinor <= 0) {
        throw new Error("Transfer amount must be a positive integer (minor units).");
      }

      const eventTypeId = this.ensureIncomeTransferEventTypeId();
      const memo = `Budget income transfer ${budget.budgetMonthKey}`;
      const existingIds = this.fundEventsRepo.listEventIdsByTypeAndMemo(eventTypeId, memo);
      if (existingIds.length > 1) {
        throw new Error(
          `Multiple income transfer events found for ${budget.budgetMonthKey}. Undo or clean duplicates first.`
        );
      }

      const payload: FundEventWithLinesUpsertInput = {
        event: {
          eventId: existingIds[0] ?? undefined,
          eventTypeId,
          eventDate: this.firstDateOfMonth(budget.budgetMonthKey),
          memo,
        },
        lines: [
          {
            lineKind: "ASSET_MONEY",
            assetId: sourceAssetId,
            liabilityId: null,
            quantityDeltaMinor: null,
            moneyDelta: -amountMinor as any,
            unitPrice: null,
            fee: null,
            notes: `Income -> Spending ${budget.budgetMonthKey}`,
          },
          {
            lineKind: "ASSET_MONEY",
            assetId: destinationAssetId,
            liabilityId: null,
            quantityDeltaMinor: null,
            moneyDelta: amountMinor as any,
            unitPrice: null,
            fee: null,
            notes: `Income -> Spending ${budget.budgetMonthKey}`,
          },
        ],
      };

      const created = this.fundEventsRepo.upsert(payload);
      return {
        budget,
        eventId: created.event.eventId,
        amountMinor,
        sourceAssetId,
        destinationAssetId,
      };
    });
  }

  private pickAccountForFund(fundId: string): { accountId: string; currencyCode: string } {
    const assets = this.assetsRepo.listByFund(fundId);
    if (assets.length > 0) {
      const accountId = assets[0].accountId;
      const account = this.accountsRepo.getById(accountId);
      return {
        accountId,
        currencyCode: account?.defaultCurrencyCode ?? "USD",
      };
    }

    const accounts = this.accountsRepo.list();
    if (accounts.length === 0) {
      throw new Error("No accounts exist. Create an account before auto-creating cash assets.");
    }

    const account = accounts[0];
    return {
      accountId: account.accountId,
      currencyCode: account.defaultCurrencyCode,
    };
  }

  copyToNextMonth(req: { budgetMonthKey: string }): Budget {
    return withTx(this.db, () => {
      const source = this.repo.getByMonth(req.budgetMonthKey);
      if (!source) {
        throw new Error(`Budget not found for month ${req.budgetMonthKey}`);
      }

      this.assertOverageConfigured({
        budgetMonthKey: source.budgetMonthKey,
        overageFundId: source.overageFundId ?? null,
        overageAssetId: source.overageAssetId ?? null,
      });

      const targetBudgetMonthKey = nextMonthKey(source.budgetMonthKey as any);
      const targetIncomeMonthKey = nextMonthKey(source.incomeMonthKey as any);

      const existingTarget = this.repo.getByMonth(targetBudgetMonthKey);
      if (existingTarget) {
        throw new Error(`Budget already exists for ${targetBudgetMonthKey}`);
      }

      const newBudgetInput: BudgetUpsertInput = {
        budgetMonthKey: targetBudgetMonthKey,
        incomeMonthKey: targetIncomeMonthKey,
        cap: source.cap,
        notes: source.notes ?? null,
        spendingFundId: source.spendingFundId ?? null,
        spendingAssetId: source.spendingAssetId ?? null,
        overageFundId: source.overageFundId ?? null,
        overageAssetId: source.overageAssetId ?? null,
        surplusHandled: false,
        leftoversHandled: false,
      };

      const newBudget = this.repo.upsert(newBudgetInput);
      this.detachIncomePostingForLinkedMonth(newBudget.incomeMonthKey);

      const sourceLines = this.linesRepo.listByBudget(source.budgetId);
      if (sourceLines.length > 0) {
        const newLines: BudgetLineUpsertInput[] = sourceLines.map((line) => ({
          budgetId: newBudget.budgetId,
          categoryId: line.categoryId,
          allocationType: line.allocationType,
          fixedAmount: line.fixedAmount ?? null,
          percent: line.percent ?? null,
        }));
        this.linesRepo.upsertMany(newBudget.budgetId, newLines);
      }

      return newBudget;
    });
  }

  private detachIncomePostingForLinkedMonth(incomeMonthKey: string): void {
    // Linked income months should not carry posting targets.
    this.incomesRepo.upsertMonth({
      incomeMonthKey,
      incomeFundId: null,
      incomeAssetId: null,
    });
  }

  private lastDateOfMonth(monthKey: string): string {
    const [yStr, mStr] = monthKey.split("-");
    const y = Number(yStr);
    const m = Number(mStr);
    if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
      throw new Error(`Invalid monthKey: ${monthKey}`);
    }
    // last day of month in UTC
    const d = new Date(Date.UTC(y, m, 0));
    return d.toISOString().slice(0, 10);
  }

  private firstDateOfMonth(monthKey: string): string {
    const [yStr, mStr] = monthKey.split("-");
    const y = Number(yStr);
    const m = Number(mStr);
    if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) {
      throw new Error(`Invalid monthKey: ${monthKey}`);
    }
    const year = String(y).padStart(4, "0");
    const month = String(m).padStart(2, "0");
    return `${year}-${month}-01`;
  }

  private totalIncomeForMonth(incomeMonthKey: string): number {
    const incomes = this.incomesRepo.listByMonth(incomeMonthKey);
    let total = 0;
    for (const income of incomes) total += Number(income.amount ?? 0);
    return total;
  }

  private ensureIncomeTransferEventTypeId(): string {
    const existing = this.eventTypesRepo.getByName("BUDGET_INCOME_TRANSFER");
    if (existing) return existing.eventTypeId;
    return this.eventTypesRepo.create({ eventType: "BUDGET_INCOME_TRANSFER" }).eventTypeId;
  }

  private resolveIncomeSourceCashAssetId(
    budget: Budget,
    req: { incomeFundId: string | null; incomeAssetId: string | null },
    excludedAssetId: string
  ): string {
    const month = this.incomesRepo.getMonth(budget.incomeMonthKey);
    const explicitAssetId =
      String(req.incomeAssetId ?? "").trim() || String(month?.incomeAssetId ?? "").trim() || null;
    const explicitFundId =
      String(req.incomeFundId ?? "").trim() || String(month?.incomeFundId ?? "").trim() || null;

    if (explicitAssetId) {
      const asset = this.assetsRepo.getById(explicitAssetId);
      if (!asset) throw new Error(`Income source asset not found: ${explicitAssetId}`);
      if (asset.assetType !== "CASH") {
        throw new Error(`Income source asset must be CASH: ${explicitAssetId}`);
      }
      if (asset.assetId === excludedAssetId) {
        throw new Error("Income source asset and budget spending asset must differ.");
      }
      if (explicitFundId && asset.fundId !== explicitFundId) {
        throw new Error(
          `Income source asset fund mismatch: asset.fundId=${asset.fundId}, incomeFundId=${explicitFundId}`
        );
      }
      return asset.assetId;
    }

    if (!explicitFundId) {
      const inferred = this.inferIncomeSourceCashAssetId(excludedAssetId);
      if (inferred) return inferred;

      throw new Error(
        `Select an income source fund/asset for ${budget.budgetMonthKey}. Income month ${budget.incomeMonthKey} is not configured and no unique source cash asset could be inferred.`
      );
    }

    const cashAssets = this.assetsRepo
      .listByFund(explicitFundId)
      .filter((a) => a.assetType === "CASH");
    const cashAssetsExceptDestination = cashAssets.filter(
      (a) => a.assetId !== excludedAssetId
    );

    if (cashAssetsExceptDestination.length === 1) return cashAssetsExceptDestination[0].assetId;
    if (cashAssets.length === 0) {
      const { accountId, currencyCode } = this.pickAccountForFund(explicitFundId);
      const created = this.assetsRepo.upsert({
        fundId: explicitFundId,
        accountId,
        name: `Auto Cash (${currencyCode})`,
        description: "Auto-created for income source transfer",
        assetType: "CASH",
        currencyCode,
      });
      if (created.assetId === excludedAssetId) {
        throw new Error("Income source asset and budget spending asset must differ.");
      }
      return created.assetId;
    }
    if (cashAssetsExceptDestination.length === 0) {
      throw new Error(
        `Income source fund ${explicitFundId} only has the spending asset selected. Choose a different income source asset.`
      );
    }
    throw new Error(
      `Multiple CASH assets found for income source fund ${explicitFundId}; set incomeAssetId explicitly.`
    );
  }

  private inferIncomeSourceCashAssetId(excludedAssetId: string): string | null {
    const cashAssets = this.assetsRepo
      .list()
      .filter((a) => a.assetType === "CASH" && a.assetId !== excludedAssetId);
    if (cashAssets.length === 1) return cashAssets[0].assetId;
    return null;
  }

  private assertOverageConfigured(input: {
    budgetMonthKey: string;
    overageFundId: string | null | undefined;
    overageAssetId: string | null | undefined;
  }): void {
    const fundId = String(input.overageFundId ?? "").trim();
    if (!fundId) {
      throw new Error(
        `Budget ${input.budgetMonthKey} requires an overage fund. Configure overageFundId before saving.`
      );
    }

    const assetId = String(input.overageAssetId ?? "").trim();
    if (!assetId) {
      const cashAssets = this.assetsRepo
        .listByFund(fundId)
        .filter((asset) => asset.assetType === "CASH");
      if (cashAssets.length > 1) {
        throw new Error(
          `Overage fund ${fundId} has multiple CASH assets; set overageAssetId for budget ${input.budgetMonthKey}.`
        );
      }
      return;
    }

    const asset = this.assetsRepo.getById(assetId);
    if (!asset) {
      throw new Error(
        `Overage asset not found: ${assetId} (budget_month=${input.budgetMonthKey})`
      );
    }
    if (asset.fundId !== fundId) {
      throw new Error(
        `Overage asset fund mismatch (budget_month=${input.budgetMonthKey}): asset.fundId=${asset.fundId}, overageFundId=${fundId}`
      );
    }
    if (asset.assetType !== "CASH") {
      throw new Error(
        `Overage asset must be CASH: ${assetId} (budget_month=${input.budgetMonthKey})`
      );
    }
  }

  private resolveBudgetSpendingCashAssetId(budget: Budget, ctx: string): string {
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
        `Budget ${budget.budgetMonthKey} has no spending fund/asset configured. Set one before transfer.`
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
        description: "Auto-created for budget spending transfer",
        assetType: "CASH",
        currencyCode,
      });
      return created.assetId;
    }

    throw new Error(
      `Multiple CASH assets found for spending fund ${explicitFundId}; set budget.spendingAssetId explicitly.`
    );
  }
}
