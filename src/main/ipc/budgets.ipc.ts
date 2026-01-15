import { ipcMain } from "electron"
import { IPC } from "../../shared/ipc/api"
import { getBudgetPlan, createBudgetPlan, saveBudgetPlan, deleteBudgetPlan } from "../db/repos/budget/index"
import { validateBudgetPlan } from "../../shared/domain/budget/validate"

export function registerBudgetHandlers(): void {
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
  ipcMain.handle(IPC.deleteBudgetPlan, (_e, monthKey: string) => deleteBudgetPlan(monthKey))
}
