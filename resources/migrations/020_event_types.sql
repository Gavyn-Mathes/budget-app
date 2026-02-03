-- resources/migrations/020_event_types.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS event_types (
  event_type_id TEXT PRIMARY KEY,       -- UUID/ULID
  event_type    TEXT NOT NULL UNIQUE,   -- display label (e.g., "DEPOSIT")
  created_at    TEXT NOT NULL,          -- ISO timestamp
  updated_at    TEXT NOT NULL,          -- ISO timestamp

  CHECK (length(trim(event_type)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_event_types_event_type
  ON event_types(event_type);
