// src/renderer/src/App.tsx
import React from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import FundsHomePage from "./pages/FundsHomePage";
import FundsListPage from "./components/features/funds/pages/FundsListPage";
import AccountsHomePage from "./pages/AccountsHomePage";
import BudgetsHomePage from "./pages/BudgetsHomePage";
import BudgetsIncomePage from "./components/features/budgets/pages/BudgetsIncomesPage";
import BudgetsCategoriesPage from "./components/features/budgets/pages/BudgetsCategoriesPage";
import BudgetsTransactionsPage from "./components/features/budgets/pages/BudgetsTransactionsPage";
import BudgetsMonthsPage from "./components/features/budgets/pages/BudgetsMonthsPage";
import BudgetsMonthPage from "./components/features/budgets/pages/BudgetsMonthPage";
import BudgetsDistributionsPage from "./components/features/budgets/pages/BudgetsDistributionsPage";
import { ComingSoon } from "./components/ui/ComingSoon";
import { AppLayout } from "./components/layout/AppLayout";
import FundsAssetsPage from "./components/features/funds/pages/FundsAssetsPage";
import FundsLiabilitiesPage from "./components/features/funds/pages/FundsLiabilitiesPage";
import FundEventsHomePage from "./components/features/funds/events/pages/FundEventsHomePage";
import EventTypesPage from "./components/features/funds/events/pages/EventTypesPage";
import FundEventLinesPage from "./components/features/funds/events/pages/FundEventsLinesPage";
import AccountsListPage from "./components/features/accounts/pages/AccountsListPage";
import AccountAssetsPage from "./components/features/accounts/pages/AccountAssetsPage";
import AccountTypesPage from "./components/features/accounts/pages/AccountTypesPage";
import AccountLiabilitiesPage from "./components/features/accounts/pages/AccountLiabilitiesPage";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<AppLayout><HomePage /></AppLayout>} />

        <Route path="/budgets" element={<AppLayout><BudgetsHomePage /></AppLayout>} />
        <Route path="/budgets/months" element={<AppLayout><BudgetsMonthsPage /></AppLayout>} />
        <Route path="/budgets/months/:monthKey" element={<AppLayout><BudgetsMonthPage /></AppLayout>} />
        <Route path="/budgets/distributions" element={<AppLayout><BudgetsDistributionsPage /></AppLayout>} />
        <Route path="/budgets/distributions/:monthKey" element={<AppLayout><BudgetsDistributionsPage /></AppLayout>} />
        <Route path="/budgets/incomes" element={<AppLayout><BudgetsIncomePage /></AppLayout>} />
        <Route path="/budgets/categories" element={<AppLayout><BudgetsCategoriesPage /></AppLayout>} />
        <Route path="/budgets/transactions" element={<AppLayout><BudgetsTransactionsPage /></AppLayout>} />
        <Route path="/funds" element={<AppLayout><FundsHomePage /></AppLayout>} />
        <Route path="/funds/list" element={<AppLayout><FundsListPage /></AppLayout>} />
        <Route path="/funds/events" element={<AppLayout><FundEventsHomePage /></AppLayout>} />
        <Route path="/funds/events/types" element={<AppLayout><EventTypesPage /></AppLayout>} />
        <Route path="/funds/events/lines" element={<AppLayout><FundEventLinesPage /></AppLayout>} />
        <Route path="/funds/assets" element={<AppLayout><FundsAssetsPage/></AppLayout>} />
        <Route path="/funds/liabilities" element={<AppLayout><FundsLiabilitiesPage/></AppLayout>} />
        <Route path="/accounts" element={<AppLayout><AccountsHomePage /></AppLayout>} />
        <Route path="/accounts/list" element={<AppLayout><AccountsListPage /></AppLayout>} />
        <Route path="/accounts/types" element={<AppLayout><AccountTypesPage/></AppLayout>} />
        <Route path="/accounts/assets" element={<AppLayout><AccountAssetsPage /></AppLayout>} />
        <Route path="/accounts/liabilities" element={<AppLayout><AccountLiabilitiesPage /></AppLayout>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
