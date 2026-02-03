-- resources/migrations/003_income.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS income (
  income_id        TEXT PRIMARY KEY, -- UUID/ULID
  income_month_key TEXT NOT NULL,
  name             TEXT NOT NULL,
  date             TEXT NOT NULL,     -- YYYY-MM-DD (or ISO datetime if you prefer)
  amount           REAL NOT NULL CHECK (amount >= 0),
  notes            TEXT,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,

  FOREIGN KEY (income_month_key)
    REFERENCES income_month(income_month_key)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  -- Basic YYYY-MM-DD shape check (not a full calendar validator)
  CHECK (
    length(date) >= 10 AND
    substr(date, 5, 1) = '-' AND
    substr(date, 8, 1) = '-'
  )
);

CREATE INDEX IF NOT EXISTS idx_income_income_month_key ON income(income_month_key);
CREATE INDEX IF NOT EXISTS idx_income_date             ON income(date);
