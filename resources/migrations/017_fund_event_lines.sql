-- resources/migrations/017_fund_event_lines.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS fund_event_line (
  line_id              TEXT PRIMARY KEY, -- UUID/ULID
  event_id             TEXT NOT NULL,
  line_no              INTEGER NOT NULL,

  asset_id             TEXT,
  liability_id         TEXT,

  line_kind            TEXT NOT NULL,     -- 'ASSET_QUANTITY' | 'ASSET_MONEY' | 'LIABILITY_MONEY'

  quantity_delta_minor INTEGER,           -- scaled integer (QTY_SCALE=1e6)
  money_delta_minor    INTEGER,           -- cents (+/-)
  fee_minor            INTEGER,           -- cents (>= 0)

  unit_price           TEXT,              -- optional (e.g. "187.32"), informational
  notes                TEXT,

  created_at           TEXT NOT NULL,
  updated_at           TEXT NOT NULL,

  FOREIGN KEY (event_id)
    REFERENCES fund_event(event_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  FOREIGN KEY (asset_id)
    REFERENCES assets(asset_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  FOREIGN KEY (liability_id)
    REFERENCES liability(liability_id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  UNIQUE(event_id, line_no),

  CHECK (line_kind IN ('ASSET_QUANTITY','ASSET_MONEY','LIABILITY_MONEY')),
  CHECK (fee_minor IS NULL OR fee_minor >= 0),

  -- exactly one target
  CHECK (
    (asset_id IS NOT NULL AND liability_id IS NULL) OR
    (asset_id IS NULL AND liability_id IS NOT NULL)
  ),

  -- enforce which delta column is used
  CHECK (
    (line_kind = 'ASSET_QUANTITY' AND asset_id IS NOT NULL AND quantity_delta_minor IS NOT NULL AND money_delta_minor IS NULL)
    OR
    (line_kind = 'ASSET_MONEY' AND asset_id IS NOT NULL AND money_delta_minor IS NOT NULL AND quantity_delta_minor IS NULL)
    OR
    (line_kind = 'LIABILITY_MONEY' AND liability_id IS NOT NULL AND money_delta_minor IS NOT NULL AND quantity_delta_minor IS NULL)
  ),

  CHECK (quantity_delta_minor IS NULL OR quantity_delta_minor <> 0),
  CHECK (money_delta_minor IS NULL OR money_delta_minor <> 0)
);

CREATE INDEX IF NOT EXISTS idx_fund_event_line_event_id
  ON fund_event_line(event_id);

CREATE INDEX IF NOT EXISTS idx_fund_event_line_asset_id
  ON fund_event_line(asset_id);

CREATE INDEX IF NOT EXISTS idx_fund_event_line_liability_id
  ON fund_event_line(liability_id);
