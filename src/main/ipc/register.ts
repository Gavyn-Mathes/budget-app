// main/ipc/register.ts
// --- categories repo (you'll implement these) ---
import { registerCategoryHandlers } from "./categories.ipc"

// --- funds repo ---
import { registerFundsHandlers } from "./funds.ipc"

// --- fund entries repo ---
import { registerFundEntriesHandlers } from "./entries.ipc"

// --- transfers repo ---
import { registerTransfersHandlers } from "./transfers.ipc"

// --- budgets repo ---
import { registerBudgetHandlers } from "./budgets.ipc"

export function registerIpcHandlers() {
  // categories
  registerCategoryHandlers()

  // funds
  registerFundsHandlers()
  
  // entries
  registerFundEntriesHandlers()

  // transfers
  registerTransfersHandlers()

  // budgets
  registerBudgetHandlers()
}
