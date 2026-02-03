-- resources/migrations/006_transactions.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS transactions (
  transaction_id TEXT PRIMARY KEY, -- UUID/ULID
  category_id    TEXT NOT NULL,
  date           TEXT NOT NULL,     -- YYYY-MM-DD (or ISO datetime)
  amount         REAL NOT NULL CHECK (amount >= 0),
  notes          TEXT,
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL,

  FOREIGN KEY (category_id)
    REFERENCES entry_categories(category_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CHECK (
    length(date) >= 10 AND
    substr(date, 5, 1) = '-' AND
    substr(date, 8, 1) = '-'
  )
);

CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date        ON transactions(date);
