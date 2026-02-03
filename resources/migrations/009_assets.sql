-- resources/migrations/009_assets.sql
-- Fund is the primary classification. Each asset belongs to exactly one fund.
-- Assets are stored in a physical account as well.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS assets (
  asset_id     TEXT PRIMARY KEY,      -- UUID/ULID
  fund_id      TEXT NOT NULL,          -- FK -> funds.fund_id
  account_id   TEXT NOT NULL,          -- FK -> accounts.account_id

  name         TEXT NOT NULL,          -- display name (e.g., "USD Cash", "AAPL")
  description  TEXT,

  asset_type   TEXT NOT NULL,          -- 'CASH' | 'STOCK' | 'NOTE'
  created_at   TEXT NOT NULL,          -- ISO timestamp
  updated_at   TEXT NOT NULL,          -- ISO timestamp

  FOREIGN KEY (fund_id)
    REFERENCES funds(fund_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  FOREIGN KEY (account_id)
    REFERENCES accounts(account_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CHECK (length(trim(name)) > 0),
  CHECK (asset_type IN ('CASH','STOCK','NOTE')),
  CHECK (length(created_at) > 0),
  CHECK (length(updated_at) > 0)
);

CREATE INDEX IF NOT EXISTS idx_assets_fund_id    ON assets(fund_id);
CREATE INDEX IF NOT EXISTS idx_assets_account_id ON assets(account_id);
