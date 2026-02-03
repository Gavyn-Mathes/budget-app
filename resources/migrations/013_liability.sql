-- resources/migrations/013_liability.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS liability (
  liability_id    TEXT PRIMARY KEY,
  fund_id         TEXT NOT NULL,
  account_id      TEXT NOT NULL,

  liability_type  TEXT NOT NULL CHECK (liability_type IN ('LOAN','CREDIT')),

  name            TEXT NOT NULL,
  apr             REAL,
  currency_code   TEXT NOT NULL,
  current_balance REAL NOT NULL,

  opened_date     TEXT,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL,
  is_active       INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
  notes           TEXT,

  FOREIGN KEY (fund_id) REFERENCES funds(fund_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON UPDATE CASCADE ON DELETE RESTRICT,

  CHECK (length(trim(name)) > 0),
  CHECK (apr IS NULL OR (apr >= 0 AND apr <= 1)),
  CHECK (length(currency_code) = 3 AND currency_code GLOB '[A-Z][A-Z][A-Z]'),
  CHECK (current_balance >= 0),
  CHECK (
    opened_date IS NULL OR
    (length(opened_date) = 10 AND substr(opened_date,5,1)='-' AND substr(opened_date,8,1)='-')
  )
);


CREATE INDEX IF NOT EXISTS idx_liability_fund_id    ON liability(fund_id);
CREATE INDEX IF NOT EXISTS idx_liability_account_id ON liability(account_id);
