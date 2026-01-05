// preload/index.ts
import { contextBridge, ipcRenderer } from "electron"
import { IPC, type Api } from "../shared/ipc/api"

const api: Api = {
  // categories
  listCategories: () => ipcRenderer.invoke(IPC.listCategories),
  createCategory: (name) => ipcRenderer.invoke(IPC.createCategory, name),
  deleteCategory: (id) => ipcRenderer.invoke(IPC.deleteCategory, id),

  // funds
  listFunds: () => ipcRenderer.invoke(IPC.listFunds),
  createFund: (input) => ipcRenderer.invoke(IPC.createFund, input),
  deleteFund: (id) => ipcRenderer.invoke(IPC.deleteFund, id),

  // entries
  createFundEntry: (input) => ipcRenderer.invoke(IPC.createFundEntry, input),
  deleteFundEntry: (id) => ipcRenderer.invoke(IPC.deleteFundEntry, id),

  // transfers
  createFundTransfer: (input) => ipcRenderer.invoke(IPC.createFundTransfer, input),
  deleteFundTransfer: (id) => ipcRenderer.invoke(IPC.deleteFundTransfer, id),

  // budgets
  createBudgetPlan: (input) => ipcRenderer.invoke(IPC.createBudgetPlan, input),
  saveBudgetPlan: (plan) => ipcRenderer.invoke(IPC.saveBudgetPlan, plan),
  getBudgetPlan: (monthKey) => ipcRenderer.invoke(IPC.getBudgetPlan, monthKey),
  deleteBudgetPlan: (id) => ipcRenderer.invoke(IPC.deleteBudgetPlan, id),
}

contextBridge.exposeInMainWorld("api", api)
