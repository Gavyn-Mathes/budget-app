-- resources/migrations/004_budgets.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS budgets (
  budget_id        TEXT PRIMARY KEY, -- UUID/ULID
  income_month_key TEXT NOT NULL,
  budget_month_key TEXT NOT NULL UNIQUE,
  cap              INTEGER NOT NULL CHECK (cap >= 0), -- minor units
  notes            TEXT,
  surplus_handled  INTEGER NOT NULL DEFAULT 0 CHECK (surplus_handled IN (0,1)),
  leftovers_handled INTEGER NOT NULL DEFAULT 0 CHECK (leftovers_handled IN (0,1)),
  spending_fund_id TEXT,
  spending_asset_id TEXT,
  overage_fund_id  TEXT,
  overage_asset_id TEXT,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,

  FOREIGN KEY (income_month_key)
    REFERENCES income_month(income_month_key)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  FOREIGN KEY (overage_fund_id)
    REFERENCES funds(fund_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  FOREIGN KEY (overage_asset_id)
    REFERENCES assets(asset_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  FOREIGN KEY (spending_fund_id)
    REFERENCES funds(fund_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  FOREIGN KEY (spending_asset_id)
    REFERENCES assets(asset_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  -- Enforce YYYY-MM and month range 01..12
  CHECK (
    length(budget_month_key) = 7 AND
    substr(budget_month_key, 5, 1) = '-' AND
    substr(budget_month_key, 1, 4) GLOB '[0-9][0-9][0-9][0-9]' AND
    substr(budget_month_key, 6, 2) GLOB '[0-9][0-9]' AND
    CAST(substr(budget_month_key, 6, 2) AS INTEGER) BETWEEN 1 AND 12
  )
);

CREATE INDEX IF NOT EXISTS idx_budgets_income_month_key ON budgets(income_month_key);
CREATE INDEX IF NOT EXISTS idx_budgets_spending_fund_id ON budgets(spending_fund_id);
CREATE INDEX IF NOT EXISTS idx_budgets_spending_asset_id ON budgets(spending_asset_id);
CREATE INDEX IF NOT EXISTS idx_budgets_overage_fund_id ON budgets(overage_fund_id);
CREATE INDEX IF NOT EXISTS idx_budgets_overage_asset_id ON budgets(overage_asset_id);
