-- resources/migrations/014_loans.sql  (liability subtype)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS loans (
  liability_id       TEXT PRIMARY KEY,  -- PK/FK -> liability.liability_id
  original_principal REAL,              -- optional, >= 0
  maturity_date      TEXT,              -- ISO 'YYYY-MM-DD' (optional)
  payment_amount     REAL,              -- optional, >= 0
  payment_frequency  TEXT,              -- optional enum

  FOREIGN KEY (liability_id)
    REFERENCES liability(liability_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CHECK (original_principal IS NULL OR original_principal >= 0),
  CHECK (payment_amount IS NULL OR payment_amount >= 0),
  CHECK (
    maturity_date IS NULL OR
    (length(maturity_date) = 10 AND substr(maturity_date,5,1)='-' AND substr(maturity_date,8,1)='-')
  ),
  CHECK (
    payment_frequency IS NULL OR
    payment_frequency IN ('WEEKLY','BIWEEKLY','MONTHLY','QUARTERLY','YEARLY','OTHER')
  )
);
