-- 002_seed_entry_categories.sql
-- Seeds built-in/default entry categories. Uses INSERT OR IGNORE so it is safe to rerun.

PRAGMA foreign_keys = ON;

-- NOTE:
-- This assumes you have a table like:
--   CREATE TABLE entry_categories (
--     id TEXT PRIMARY KEY,
--     name TEXT NOT NULL UNIQUE,
--     created_at TEXT NOT NULL,
--     updated_at TEXT NOT NULL
--   );

INSERT OR IGNORE INTO entry_categories (id, name, created_at, updated_at)
VALUES
  ('cat_rent',      'Rent',      datetime('now'), datetime('now')),
  ('cat_food',      'Food',      datetime('now'), datetime('now')),
  ('cat_gift',      'Gift',      datetime('now'), datetime('now')),
  ('cat_gas',       'Gas',       datetime('now'), datetime('now')),
  ('cat_utilities', 'Utilities', datetime('now'), datetime('now')),
  ('cat_stocks',    'Stocks',    datetime('now'), datetime('now')),
  ('cat_bonds',     'Bonds',     datetime('now'), datetime('now'));
  ('cat_transfer',  'Transfers',     datetime('now'), datetime('now'));