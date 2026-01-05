// shared/ipc/api.ts
import type { Fund, FundEntry, FundTransfer } from "../domain/fund/types"
import type { BudgetPlan } from "../domain/budget/types"

export const IPC = {
  // categories
  listCategories: "categories:list",
  createCategory: "categories:create",
  deleteCategory: "categories:delete",

  // funds
  createFund: "funds:create",
  deleteFund: "funds:delete",
  listFunds: "funds:list",

  // fund entries
  createFundEntry: "fundEntries:create",
  deleteFundEntry: "fundEntries:delete",

  // transfers
  createFundTransfer: "fundTransfers:create",
  deleteFundTransfer: "fundTransfers:delete",

  // budgets
  createBudgetPlan: "budgetPlans:create",
  saveBudgetPlan: "budgetPlans:save",
  getBudgetPlan: "budgetPlans:get",
  deleteBudgetPlan: "budgetPlans:delete",
} as const

export type Category = { id: string; name: string; createdAt: string; updatedAt: string }

// Inputs (avoid sending derived fields from renderer)
export type CreateFundInput = Omit<Fund, "id" | "balance" | "updatedAt"> & { currency?: "USD" }
export type CreateFundEntryInput = Omit<FundEntry, "id">
export type CreateFundTransferInput = Omit<FundTransfer, "id" | "fromEntryId" | "toEntryId">
export type CreateBudgetPlanInput = Omit<BudgetPlan, "id">

export type Api = {
  // categories
  listCategories(): Promise<Category[]>
  createCategory(name: string): Promise<Category>
  deleteCategory(categoryId: string): Promise<void>

  // funds
  listFunds(): Promise<Fund[]>
  createFund(input: CreateFundInput): Promise<Fund>
  deleteFund(fundId: string): Promise<void>

  // entries
  createFundEntry(input: CreateFundEntryInput): Promise<FundEntry>
  deleteFundEntry(entryId: string): Promise<void>

  // transfers
  createFundTransfer(input: CreateFundTransferInput): Promise<FundTransfer>
  deleteFundTransfer(transferId: string): Promise<void>

  // budgets
  createBudgetPlan(input: CreateBudgetPlanInput): Promise<BudgetPlan>
  saveBudgetPlan(plan: BudgetPlan): Promise<BudgetPlan>
  getBudgetPlan(monthKey: string): Promise<BudgetPlan | null>
  deleteBudgetPlan(planId: string): Promise<void>
}
