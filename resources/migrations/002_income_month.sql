-- resources/migrations/002_income_month.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS income_month (
  income_month_key TEXT PRIMARY KEY,
  income_fund_id   TEXT,
  income_asset_id  TEXT,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,

  FOREIGN KEY (income_fund_id)
    REFERENCES funds(fund_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  FOREIGN KEY (income_asset_id)
    REFERENCES assets(asset_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  -- Enforce YYYY-MM and month range 01..12
  CHECK (
    length(income_month_key) = 7 AND
    substr(income_month_key, 5, 1) = '-' AND
    substr(income_month_key, 1, 4) GLOB '[0-9][0-9][0-9][0-9]' AND
    substr(income_month_key, 6, 2) GLOB '[0-9][0-9]' AND
    CAST(substr(income_month_key, 6, 2) AS INTEGER) BETWEEN 1 AND 12
  )
);

CREATE INDEX IF NOT EXISTS idx_income_month_income_fund_id
  ON income_month(income_fund_id);

CREATE INDEX IF NOT EXISTS idx_income_month_income_asset_id
  ON income_month(income_asset_id);
