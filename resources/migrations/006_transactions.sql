-- resources/migrations/006_transactions.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS transactions (
  transaction_id TEXT PRIMARY KEY, -- UUID/ULID
  category_id    TEXT NOT NULL,
  fund_event_id  TEXT,
  date           TEXT NOT NULL,     -- YYYY-MM-DD (or ISO datetime)
  amount         INTEGER NOT NULL CHECK (amount >= 0), -- minor units
  notes          TEXT,
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL,

  FOREIGN KEY (category_id)
    REFERENCES entry_categories(category_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  FOREIGN KEY (fund_event_id)
    REFERENCES fund_event(event_id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  CHECK (
    length(date) >= 10 AND
    substr(date, 5, 1) = '-' AND
    substr(date, 8, 1) = '-'
  )
);

CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date        ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_fund_event_id ON transactions(fund_event_id);
