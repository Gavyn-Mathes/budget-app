-- resources/migrations/005_budget_lines.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS budget_lines (
  budget_id        TEXT NOT NULL,
  category_id      TEXT NOT NULL,
  allocation_type  TEXT NOT NULL CHECK (allocation_type IN ('FIXED','PERCENT')),
  fixed_amount     REAL CHECK (fixed_amount >= 0),
  percent          REAL CHECK (percent >= 0 AND percent <= 1),
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,

  -- Composite PK (one line per category per budget)
  PRIMARY KEY (budget_id, category_id),

  FOREIGN KEY (budget_id)
    REFERENCES budgets(budget_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  FOREIGN KEY (category_id)
    REFERENCES entry_categories(category_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  -- Exactly one of fixed_amount/percent based on allocation_type
  CHECK (
    (allocation_type = 'FIXED'   AND fixed_amount IS NOT NULL AND percent IS NULL)
    OR
    (allocation_type = 'PERCENT' AND percent IS NOT NULL AND fixed_amount IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_budget_lines_category_id ON budget_lines(category_id);
