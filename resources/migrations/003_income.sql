-- resources/migrations/003_income.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS income (
  income_id        TEXT PRIMARY KEY, -- UUID/ULID
  income_month_key TEXT NOT NULL,
  fund_event_id    TEXT,
  name             TEXT NOT NULL,
  date             TEXT NOT NULL,     -- YYYY-MM-DD (or ISO datetime if you prefer)
  amount           INTEGER NOT NULL CHECK (amount >= 0), -- minor units
  notes            TEXT,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,

  FOREIGN KEY (income_month_key)
    REFERENCES income_month(income_month_key)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  FOREIGN KEY (fund_event_id)
    REFERENCES fund_event(event_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  -- Basic YYYY-MM-DD shape check (not a full calendar validator)
  CHECK (
    length(date) >= 10 AND
    substr(date, 5, 1) = '-' AND
    substr(date, 8, 1) = '-'
  )
);

CREATE INDEX IF NOT EXISTS idx_income_income_month_key ON income(income_month_key);
CREATE INDEX IF NOT EXISTS idx_income_date             ON income(date);
CREATE INDEX IF NOT EXISTS idx_income_fund_event_id    ON income(fund_event_id);
