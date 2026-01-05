// main/ipc/register.ts
import { ipcMain } from "electron"
import { IPC } from "../../shared/ipc/api"

// --- categories repo (you'll implement these) ---
import {
  listCategories,
  createCategory,
  deleteCategory,
} from "../db/repos/fund/categories.repo"

// --- funds repo ---
import { listFunds, createFund, deleteFund } from "../db/repos/fund/funds.repo"

// --- fund entries repo ---
import { createFundEntry, deleteFundEntry } from "../db/repos/fund/entries.repo"

// --- transfers repo ---
import { createFundTransfer, deleteFundTransfer } from "../db/repos/fund/transfers.repo"

// --- budgets repo ---
import { createBudgetPlan, saveBudgetPlan, getBudgetPlan, deleteBudgetPlan } from "../db/repos/budget/plans.repo"

// --- optional: validators from shared ---
import { validateFundEntry } from "../../shared/domain/fund/validate"
import { validateBudgetPlan } from "../../shared/domain/budget/validate"

export function registerIpcHandlers() {
  // categories
  ipcMain.handle(IPC.listCategories, () => listCategories())
  ipcMain.handle(IPC.createCategory, (_e, name: string) => createCategory(name))
  ipcMain.handle(IPC.deleteCategory, (_e, categoryId: string) => deleteCategory(categoryId))

  // funds
  ipcMain.handle(IPC.listFunds, () => listFunds())
  ipcMain.handle(IPC.createFund, (_e, input) => createFund(input))
  ipcMain.handle(IPC.deleteFund, (_e, fundId: string) => deleteFund(fundId))

  // entries
  ipcMain.handle(IPC.createFundEntry, (_e, input) => {
    const errs = validateFundEntry(input)
    if (errs.length) throw new Error(errs.join("; "))
    return createFundEntry(input)
  })
  ipcMain.handle(IPC.deleteFundEntry, (_e, entryId: string) => deleteFundEntry(entryId))

  // transfers
  ipcMain.handle(IPC.createFundTransfer, (_e, input) => createFundTransfer(input))
  ipcMain.handle(IPC.deleteFundTransfer, (_e, transferId: string) => deleteFundTransfer(transferId))

  // budgets
  ipcMain.handle(IPC.createBudgetPlan, (_e, input) => {
    const errs = validateBudgetPlan(input)
    if (errs.length) throw new Error(errs.join("; "))
    return createBudgetPlan(input)
  })
  ipcMain.handle(IPC.saveBudgetPlan, (_e, plan) => {
    const errs = validateBudgetPlan(plan)
    if (errs.length) throw new Error(errs.join("; "))
    return saveBudgetPlan(plan)
  })
  ipcMain.handle(IPC.getBudgetPlan, (_e, monthKey: string) => getBudgetPlan(monthKey))
  ipcMain.handle(IPC.deleteBudgetPlan, (_e, planId: string) => deleteBudgetPlan(planId))
}
