import { useState } from "react"
import HomePage from "../pages/HomePage"
import CategoriesPage from "../pages/CategoriesPage"
import FundsPage from "../pages/FundsPage"
import FundEntriesPage from "../pages/FundEntriesPage"
import BudgetPlanPage from "../pages/BudgetPlanPage"
import TransfersPage from "../pages/FundTransfersPage"

type Page = "home" | "categories" | "funds" | "entries" | "budgets" | "transfers"

export default function App() {
  const [page, setPage] = useState<Page>("home")

  return (
    <div>
      <header style={{ padding: 12, borderBottom: "1px solid #ddd", display: "flex", gap: 12 }}>
        <button style={{color: "#000"}} onClick={() => setPage("home")}>Home</button>
        <button onClick={() => setPage("categories")}>Categories</button>
        <button onClick={() => setPage("funds")}>Funds</button>
        <button onClick={() => setPage("entries")}>Fund Entries</button>
        <button onClick={() => setPage("budgets")}>Budgets</button>
        <button onClick={() => setPage("transfers")}>Transfers</button>
      </header>

      {page === "home" && <HomePage go={setPage} />}
      {page === "categories" && <CategoriesPage />}
      {page === "funds" && <FundsPage />}
      {page === "entries" && <FundEntriesPage />}
      {page === "budgets" && <BudgetPlanPage />}
      {page === "transfers" && <TransfersPage/>}
    </div>
  )
}
