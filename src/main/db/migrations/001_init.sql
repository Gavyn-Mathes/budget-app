-- Enforce foreign key constraints (must be enabled per-connection in SQLite).
PRAGMA foreign_keys = ON;

-- User-defined spending/income categories (e.g., "Rent", "Caffeine").
CREATE TABLE IF NOT EXISTS entry_categories (
  id         TEXT PRIMARY KEY,        -- UUID/ULID
  name       TEXT NOT NULL UNIQUE,     -- display name (unique)
  created_at TEXT NOT NULL,            -- ISO timestamp
  updated_at TEXT NOT NULL             -- ISO timestamp
);

-- Pools of money (e.g., "SPEND", "EFUND", "SAVE").
CREATE TABLE IF NOT EXISTS funds (
  id         TEXT PRIMARY KEY,         -- UUID/ULID
  key        TEXT NOT NULL UNIQUE,      -- stable short key ("SPEND")
  name       TEXT NOT NULL,             -- display name
  currency   TEXT NOT NULL CHECK (currency = 'USD'),
  updated_at TEXT NOT NULL              -- ISO timestamp
);

-- Transfer "header" row. Deleting a transfer should delete its two entries.
CREATE TABLE IF NOT EXISTS fund_transfers (
  id           TEXT PRIMARY KEY,        -- UUID/ULID
  from_fund_id TEXT NOT NULL,           -- source fund
  to_fund_id   TEXT NOT NULL,           -- destination fund
  date         TEXT NOT NULL,           -- ISO date/timestamp (same convention as fund_entries.date)
  month_key    TEXT NOT NULL CHECK (length(month_key) = 7), -- "YYYY-MM"
  amount       REAL NOT NULL CHECK (amount > 0),            -- always positive
  memo         TEXT,                    -- optional note
  created_at   TEXT NOT NULL,           -- ISO timestamp
  updated_at   TEXT NOT NULL,           -- ISO timestamp
  FOREIGN KEY (from_fund_id) REFERENCES funds(id) ON DELETE RESTRICT,
  FOREIGN KEY (to_fund_id)   REFERENCES funds(id) ON DELETE RESTRICT,
  CHECK (from_fund_id <> to_fund_id)
);

CREATE INDEX IF NOT EXISTS idx_transfers_month ON fund_transfers(month_key);
CREATE INDEX IF NOT EXISTS idx_transfers_from_month ON fund_transfers(from_fund_id, month_key);
CREATE INDEX IF NOT EXISTS idx_transfers_to_month ON fund_transfers(to_fund_id, month_key);

-- Ledger entries that move money into/out of a fund.
-- For TRANSFER entries, transfer_id links the paired rows.
CREATE TABLE IF NOT EXISTS fund_entries (
  id            TEXT PRIMARY KEY,       -- UUID/ULID
  fund_id       TEXT NOT NULL,           -- FK -> funds.id
  transfer_id   TEXT,                    -- FK -> fund_transfers.id (NULL unless kind='TRANSFER')
  date          TEXT NOT NULL,           -- ISO date or timestamp
  month_key     TEXT NOT NULL CHECK (length(month_key) = 7), -- "YYYY-MM"
  amount        REAL NOT NULL,           -- signed amount (+inflow, -outflow)
  kind          TEXT NOT NULL CHECK (kind IN ('INCOME','EXPENSE','TRANSFER')),
  category_id   TEXT NOT NULL,           -- FK -> entry_categories.id
  tax_treatment TEXT CHECK (tax_treatment IN ('TAXABLE','NONTAXABLE','UNKNOWN')),
  memo          TEXT,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES entry_categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (fund_id)     REFERENCES funds(id) ON DELETE RESTRICT,
  FOREIGN KEY (transfer_id) REFERENCES fund_transfers(id) ON DELETE CASCADE,
  CHECK (
    (kind = 'TRANSFER' AND transfer_id IS NOT NULL)
    OR
    (kind <> 'TRANSFER' AND transfer_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_entries_month ON fund_entries(month_key);
CREATE INDEX IF NOT EXISTS idx_entries_month_kind ON fund_entries(month_key, kind);
CREATE INDEX IF NOT EXISTS idx_entries_month_category_id ON fund_entries(month_key, category_id);
CREATE INDEX IF NOT EXISTS idx_entries_fund_month ON fund_entries(fund_id, month_key);
CREATE INDEX IF NOT EXISTS idx_entries_fund_id ON fund_entries(fund_id);
CREATE INDEX IF NOT EXISTS idx_entries_transfer_id ON fund_entries(transfer_id);

-- Budget plan header: one per month
CREATE TABLE IF NOT EXISTS budget_plans (
  id         TEXT PRIMARY KEY,                                     -- UUID/ULID
  month_key  TEXT NOT NULL UNIQUE CHECK (length(month_key) = 7),    -- "YYYY-MM"
  currency   TEXT NOT NULL CHECK (currency = 'USD'),
  income     REAL NOT NULL CHECK (income >= 0),                     -- reference income for planning
  cap        REAL NOT NULL CHECK (cap >= 0),                        -- spending cap for the month
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Expense slices (planned “pie chart”)
CREATE TABLE IF NOT EXISTS budget_expense_slices (
  id             TEXT PRIMARY KEY,                                  -- UUID/ULID
  budget_plan_id TEXT NOT NULL,                                      -- FK -> budget_plans.id
  category_id    TEXT NOT NULL,                                      -- FK -> entry_categories.id
  mode           TEXT NOT NULL CHECK (mode IN ('FIXED','PERCENT','MANUAL')),
  fixed          REAL CHECK (fixed >= 0),
  percent        REAL CHECK (percent >= 0 AND percent <= 1),
  base           TEXT CHECK (base IN ('CAP','NET_CAP')),
  amount         REAL CHECK (amount >= 0),
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL,
  FOREIGN KEY (budget_plan_id) REFERENCES budget_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id)    REFERENCES entry_categories(id) ON DELETE RESTRICT,
  CHECK (
    (mode = 'FIXED'   AND fixed   IS NOT NULL AND percent IS NULL AND base IS NULL AND amount IS NULL)
    OR
    (mode = 'PERCENT' AND percent IS NOT NULL AND base IS NOT NULL AND fixed IS NULL AND amount IS NULL)
    OR
    (mode = 'MANUAL'  AND amount  IS NOT NULL AND fixed IS NULL AND percent IS NULL AND base IS NULL)
  )
);

-- One slice per category per plan
CREATE UNIQUE INDEX IF NOT EXISTS uq_budget_slices_plan_category
  ON budget_expense_slices(budget_plan_id, category_id);

CREATE INDEX IF NOT EXISTS idx_budget_slices_plan
  ON budget_expense_slices(budget_plan_id);

-- Distribution rules: remainder/surplus -> funds
CREATE TABLE IF NOT EXISTS budget_distributions (
  id                TEXT PRIMARY KEY,                               -- UUID/ULID
  budget_plan_id    TEXT NOT NULL,                                   -- FK -> budget_plans.id
  distribution_type TEXT NOT NULL CHECK (distribution_type IN ('REMAINDER','SURPLUS')),
  fund_id           TEXT NOT NULL,                                   -- FK -> funds.id
  percentage        REAL NOT NULL CHECK (percentage >= 0 AND percentage <= 1),
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL,
  FOREIGN KEY (budget_plan_id) REFERENCES budget_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (fund_id)        REFERENCES funds(id) ON DELETE RESTRICT
);

-- One rule per fund per plan per distribution type
CREATE UNIQUE INDEX IF NOT EXISTS uq_budget_dist_plan_type_fund
  ON budget_distributions(budget_plan_id, distribution_type, fund_id);

CREATE INDEX IF NOT EXISTS idx_budget_dist_plan_type
  ON budget_distributions(budget_plan_id, distribution_type);
