-- resources/migrations/008_funds.sql
-- Virtual buckets/envelopes used for classification (NOT physical accounts).
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS funds (
  fund_id     TEXT PRIMARY KEY,      -- UUID/ULID
  name        TEXT NOT NULL,          -- display name
  description TEXT,                   -- optional
  created_at  TEXT NOT NULL,          -- ISO timestamp
  updated_at  TEXT NOT NULL,          -- ISO timestamp

  -- Basic sanity checks
  CHECK (length(trim(name)) > 0),
  CHECK (length(created_at) > 0),
  CHECK (length(updated_at) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_funds_name ON funds(name);