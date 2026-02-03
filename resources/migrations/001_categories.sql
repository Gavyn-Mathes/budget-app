-- resources/migrations/001_categories.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS entry_categories (
  category_id         TEXT PRIMARY KEY,         -- UUID/ULID
  name                TEXT NOT NULL UNIQUE,     -- display name (unique)
  created_at          TEXT NOT NULL,            -- ISO timestamp
  updated_at          TEXT NOT NULL             -- ISO timestamp
);
