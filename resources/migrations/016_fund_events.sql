-- resources/migrations/016_fund_event.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS fund_event (
  event_id      TEXT PRIMARY KEY,   -- UUID/ULID
  event_date    TEXT NOT NULL,      -- ISO date 'YYYY-MM-DD'
  event_type_id TEXT NOT NULL,      -- FK -> event_types.event_type_id
  memo          TEXT,
  created_at    TEXT NOT NULL,      -- ISO timestamp
  updated_at    TEXT NOT NULL,      -- ISO timestamp


  -- Enforce 'YYYY-MM-DD'
  CHECK (
    length(event_date) = 10 AND
    substr(event_date,5,1)='-' AND substr(event_date,8,1)='-' AND
    substr(event_date,1,4) GLOB '[0-9][0-9][0-9][0-9]' AND
    substr(event_date,6,2) GLOB '[0-9][0-9]' AND
    substr(event_date,9,2) GLOB '[0-9][0-9]'
  )
);

CREATE INDEX IF NOT EXISTS idx_fund_event_event_date ON fund_event(event_date);
CREATE INDEX IF NOT EXISTS idx_fund_event_event_type ON fund_event(event_type_id);
