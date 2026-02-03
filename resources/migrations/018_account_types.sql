-- resources/migrations/018_account_types.sql
-- Account type lookup (e.g., "Checking", "Brokerage")
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS account_types (
  account_type_id TEXT PRIMARY KEY,        -- AccountTypeId (UUID/ULID)
  account_type    TEXT NOT NULL UNIQUE,    -- display label
  created_at      TEXT NOT NULL,           -- ISO timestamp
  updated_at      TEXT NOT NULL,           -- ISO timestamp

  CHECK (length(trim(account_type)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_account_types_account_type
  ON account_types(account_type);
