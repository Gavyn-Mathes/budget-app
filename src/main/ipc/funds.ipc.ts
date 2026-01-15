import { ipcMain } from "electron"
import { IPC } from "../../shared/ipc/api"
import { listFunds, createFund, deleteFund } from "../db/repos/fund/funds.repo"

export function registerFundsHandlers(): void {
  ipcMain.handle(IPC.listFunds, () => listFunds())
  ipcMain.handle(IPC.createFund, (_e, input) => createFund(input))
  ipcMain.handle(IPC.deleteFund, (_e, fundId: string) => deleteFund(fundId))
}
