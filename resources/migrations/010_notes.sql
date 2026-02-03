-- resources/migrations/010_notes.sql
-- Notes = loan/note assets where YOU are the lender (receivable).
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS notes (
  asset_id      TEXT PRIMARY KEY,  -- PK/FK -> assets.asset_id
  counterparty  TEXT,
  interest_rate REAL NOT NULL,
  start_date    TEXT,              -- ISO 'YYYY-MM-DD'
  maturity_date TEXT,              -- ISO 'YYYY-MM-DD'

  FOREIGN KEY (asset_id)
    REFERENCES assets(asset_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CHECK (interest_rate >= 0 AND interest_rate <= 1),
  CHECK (
    start_date IS NULL OR
    (length(start_date) = 10 AND substr(start_date,5,1)='-' AND substr(start_date,8,1)='-')
  ),
  CHECK (
    maturity_date IS NULL OR
    (length(maturity_date) = 10 AND substr(maturity_date,5,1)='-' AND substr(maturity_date,8,1)='-')
  ),
  CHECK (start_date IS NULL OR maturity_date IS NULL OR maturity_date >= start_date)
);
