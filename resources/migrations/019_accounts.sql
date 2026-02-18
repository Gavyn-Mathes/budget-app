-- resources/migrations/018_accounts.sql
-- Physical accounts / locations where money lives (e.g., Checking, Brokerage, Wallet).
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS accounts (
  account_id            TEXT PRIMARY KEY,  -- UUID/ULID
  name                  TEXT NOT NULL,
  account_type_id       TEXT NOT NULL,      -- FK -> account_types.account_type_id
  default_currency_code TEXT NOT NULL,      -- required default like 'USD'
  description           TEXT,
  created_at            TEXT NOT NULL,      -- ISO timestamp
  updated_at            TEXT NOT NULL,      -- ISO timestamp

  CHECK (length(trim(name)) > 0),

  -- Enforce ISO 4217-like code (3 uppercase letters)
  CHECK (
    length(default_currency_code) = 3 AND
    default_currency_code GLOB '[A-Z][A-Z][A-Z]'
  ),

  UNIQUE(name, account_type_id),

  FOREIGN KEY (account_type_id)
    REFERENCES account_types(account_type_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_accounts_account_type_id
  ON accounts(account_type_id);
