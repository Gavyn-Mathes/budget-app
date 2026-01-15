// shared/ipc/api.ts

import { listFundEntries } from "../../main/db/repos/fund";

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
  listFundEntries: "fundEntries:list",

  // transfers
  createFundTransfer: "fundTransfers:create",
  deleteFundTransfer: "fundTransfers:delete",
  listFundTransfers: "fundTransfers:list",

  // budgets
  createBudgetPlan: "budgetPlans:create",
  saveBudgetPlan: "budgetPlans:save",
  getBudgetPlan: "budgetPlans:get",
  deleteBudgetPlan: "budgetPlans:delete",
} as const

export type Category = { id: string; name: string; createdAt: string; updatedAt: string }
export type Fund = import("../domain/fund/types").Fund
export type FundEntry = import("../domain/fund/types").FundEntry
export type FundTransfer = import("../domain/fund/types").FundTransfer
export type BudgetPlan = import("../domain/budget/types").BudgetPlan

// Inputs (avoid sending derived fields from renderer)
export type CreateFundInput = Pick<Fund, "key" | "name"> & { currency?: "USD" }
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
  listFundEntries(fundId?: string): Promise<FundEntry[]>

  // transfers
  createFundTransfer(input: CreateFundTransferInput): Promise<FundTransfer>
  deleteFundTransfer(transferId: string): Promise<void>
  listFundTransfers(fromFundId?: string, toFundId?: string): Promise<FundTransfer[]>

  // budgets
  createBudgetPlan(input: CreateBudgetPlanInput): Promise<BudgetPlan>
  saveBudgetPlan(plan: BudgetPlan): Promise<BudgetPlan>
  getBudgetPlan(monthKey: string): Promise<BudgetPlan | null>
  deleteBudgetPlan(monthKey: string): Promise<void>
}
