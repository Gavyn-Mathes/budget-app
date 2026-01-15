import { ipcMain } from "electron"
import { IPC } from "../../shared/ipc/api"
import { listFundEntries, createFundEntry, deleteFundEntry } from "../db/repos/fund/entries.repo"
import { validateFundEntry } from "../../shared/domain/fund/validate"

export function registerFundEntriesHandlers(): void {
  ipcMain.handle(IPC.createFundEntry, (_e, input) => {
    const errs = validateFundEntry(input)
    if (errs.length) throw new Error(errs.join("; "))
    return createFundEntry(input)
  })
  ipcMain.handle(IPC.deleteFundEntry, (_e, entryId: string) => deleteFundEntry(entryId))
  ipcMain.handle(IPC.listFundEntries, (_e, fundId?: string) => listFundEntries(fundId))
}
