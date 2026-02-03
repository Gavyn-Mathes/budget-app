-- resources/migrations/007_distributions.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS distribution (
  distribution_rule_id TEXT PRIMARY KEY, -- UUID/ULID

  budget_id        TEXT NOT NULL,
  source_type      TEXT NOT NULL CHECK (source_type IN ('SURPLUS','CATEGORY')),
  category_id      TEXT,                 -- required if source_type='CATEGORY'
  fund_id          TEXT NOT NULL,         -- references your Funds table (elsewhere)

  allocation_type  TEXT NOT NULL CHECK (allocation_type IN ('FIXED','PERCENT')),
  fixed_amount     REAL CHECK (fixed_amount >= 0),
  percent          REAL CHECK (percent >= 0 AND percent <= 1),

  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL,

  FOREIGN KEY (budget_id)
    REFERENCES budgets(budget_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  FOREIGN KEY (category_id)
    REFERENCES entry_categories(category_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  -- If CATEGORY, category_id must be present; if SURPLUS, must be NULL
  CHECK (
    (source_type = 'SURPLUS'  AND category_id IS NULL)
    OR
    (source_type = 'CATEGORY' AND category_id IS NOT NULL)
  ),

  -- Exactly one of fixed_amount/percent based on allocation_type
  CHECK (
    (allocation_type = 'FIXED'   AND fixed_amount IS NOT NULL AND percent IS NULL)
    OR
    (allocation_type = 'PERCENT' AND percent IS NOT NULL AND fixed_amount IS NULL)
  )

  -- Optional if your funds table exists in the same DB:
  -- ,FOREIGN KEY (fund_id) REFERENCES funds(fund_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_distribution_budget_id   ON distribution(budget_id);
CREATE INDEX IF NOT EXISTS idx_distribution_category_id ON distribution(category_id);
CREATE INDEX IF NOT EXISTS idx_distribution_fund_id     ON distribution(fund_id);
