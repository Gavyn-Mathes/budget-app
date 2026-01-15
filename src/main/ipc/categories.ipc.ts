import { ipcMain } from "electron"
import { IPC } from "../../shared/ipc/api"
import { createCategory, deleteCategory, listCategories } from "../db/repos/fund/categories.repo"

export function registerCategoryHandlers(): void {
  ipcMain.handle(IPC.listCategories, () => listCategories())
  ipcMain.handle(IPC.createCategory, (_evt, name: string) => createCategory(name))
  ipcMain.handle(IPC.deleteCategory, (_evt, categoryId: string) => {
    deleteCategory(categoryId)
  })
}
