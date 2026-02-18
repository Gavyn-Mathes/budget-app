-- resources/migrations/013_liability.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS liability (
  liability_id    TEXT PRIMARY KEY,
  fund_id         TEXT NOT NULL,
  account_id      TEXT NOT NULL,

  liability_type  TEXT NOT NULL CHECK (liability_type IN ('LOAN','CREDIT')),

  name            TEXT NOT NULL,
  apr             REAL,

  opened_date     TEXT,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL,
  is_active       INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
  notes           TEXT,

  FOREIGN KEY (fund_id) REFERENCES funds(fund_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON UPDATE CASCADE ON DELETE RESTRICT,

  CHECK (length(trim(name)) > 0),
  CHECK (apr IS NULL OR (apr >= 0 AND apr <= 1)),
  CHECK (
    opened_date IS NULL OR
    (length(opened_date) = 10 AND substr(opened_date,5,1)='-' AND substr(opened_date,8,1)='-')
  )
);


CREATE INDEX IF NOT EXISTS idx_liability_fund_id    ON liability(fund_id);
CREATE INDEX IF NOT EXISTS idx_liability_account_id ON liability(account_id);

CREATE TABLE IF NOT EXISTS liability_account_move (
  move_id          TEXT PRIMARY KEY, -- UUID/ULID
  liability_id     TEXT NOT NULL,
  from_account_id  TEXT NOT NULL,
  to_account_id    TEXT NOT NULL,
  event_date       TEXT NOT NULL,     -- ISO date 'YYYY-MM-DD'
  memo             TEXT,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,

  FOREIGN KEY (liability_id)
    REFERENCES liability(liability_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  FOREIGN KEY (from_account_id)
    REFERENCES accounts(account_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  FOREIGN KEY (to_account_id)
    REFERENCES accounts(account_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CHECK (from_account_id <> to_account_id),

  -- Enforce 'YYYY-MM-DD'
  CHECK (
    length(event_date) = 10 AND
    substr(event_date,5,1)='-' AND substr(event_date,8,1)='-' AND
    substr(event_date,1,4) GLOB '[0-9][0-9][0-9][0-9]' AND
    substr(event_date,6,2) GLOB '[0-9][0-9]' AND
    substr(event_date,9,2) GLOB '[0-9][0-9]'
  ),

  CHECK (length(created_at) > 0),
  CHECK (length(updated_at) > 0)
);

CREATE INDEX IF NOT EXISTS idx_liability_account_move_liability_id
  ON liability_account_move(liability_id);

CREATE INDEX IF NOT EXISTS idx_liability_account_move_event_date
  ON liability_account_move(event_date);
