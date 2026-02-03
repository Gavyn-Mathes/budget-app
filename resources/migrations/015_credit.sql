-- resources/migrations/015_credit.sql  (liability subtype)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS credit (
  liability_id      TEXT PRIMARY KEY,  -- PK/FK -> liability.liability_id
  credit_limit      REAL,              -- optional, >= 0
  due_day           INTEGER,           -- 1..31 (optional)
  min_payment_type  TEXT,              -- FIXED or PERCENT (optional)
  min_payment_value REAL,              -- optional
  statement_day     INTEGER,           -- 1..31 (optional)

  FOREIGN KEY (liability_id)
    REFERENCES liability(liability_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CHECK (credit_limit IS NULL OR credit_limit >= 0),
  CHECK (due_day IS NULL OR (due_day BETWEEN 1 AND 31)),
  CHECK (statement_day IS NULL OR (statement_day BETWEEN 1 AND 31)),
  CHECK (min_payment_type IS NULL OR min_payment_type IN ('FIXED','PERCENT')),
  CHECK (min_payment_value IS NULL OR min_payment_value >= 0),

  -- If min_payment_type is set, value must be set.
  CHECK (
    min_payment_type IS NULL OR
    min_payment_value IS NOT NULL
  ),

  -- If percent-based min payment, keep it 0..1 (decimal).
  CHECK (
    min_payment_type != 'PERCENT' OR
    (min_payment_value IS NOT NULL AND min_payment_value >= 0 AND min_payment_value <= 1)
  )
);
