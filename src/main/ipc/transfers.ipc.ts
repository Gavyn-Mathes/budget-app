import { ipcMain } from "electron"
import { IPC } from "../../shared/ipc/api"
import { createFundTransfer, deleteFundTransfer, listFundTransfers } from "../db/repos/fund/transfers.repo"

export function registerTransfersHandlers(): void {
  ipcMain.handle(IPC.createFundTransfer, (_e, input) => createFundTransfer(input))
  ipcMain.handle(IPC.deleteFundTransfer, (_e, transferId: string) => deleteFundTransfer(transferId))
  ipcMain.handle(IPC.listFundTransfers, (_e, fromFundId?: string, toFundId?: string) => listFundTransfers(fromFundId, toFundId))
}
