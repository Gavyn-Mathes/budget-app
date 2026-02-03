-- resources/migrations/017_fund_event_lines.sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS fund_event_line (
  line_id        TEXT PRIMARY KEY, -- UUID/ULID
  event_id       TEXT NOT NULL,

  asset_id       TEXT,             -- nullable (set for asset lines)
  liability_id   TEXT,             -- nullable (set for liability lines)

  quantity_delta REAL,             -- used when asset_id is set (+/-)
  balance_delta  REAL,             -- used when liability_id is set (+/-)

  unit_price     REAL,             -- optional (>= 0), useful for buys/sells
  fee            REAL,             -- optional (>= 0)
  notes          TEXT,

  created_at     TEXT NOT NULL,    -- ISO timestamp
  updated_at     TEXT NOT NULL,    -- ISO timestamp

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

  CHECK (unit_price IS NULL OR unit_price >= 0),
  CHECK (fee IS NULL OR fee >= 0),

  -- EXACTLY ONE TARGET per line, with matching delta column
  CHECK (
    (asset_id IS NOT NULL AND liability_id IS NULL AND quantity_delta IS NOT NULL AND balance_delta IS NULL)
    OR
    (liability_id IS NOT NULL AND asset_id IS NULL AND balance_delta IS NOT NULL AND quantity_delta IS NULL)
  ),

  -- Disallow zero deltas
  CHECK (quantity_delta IS NULL OR quantity_delta <> 0),
  CHECK (balance_delta  IS NULL OR balance_delta  <> 0)
);

CREATE INDEX IF NOT EXISTS idx_fund_event_line_event_id
  ON fund_event_line(event_id);

CREATE INDEX IF NOT EXISTS idx_fund_event_line_asset_id
  ON fund_event_line(asset_id);

CREATE INDEX IF NOT EXISTS idx_fund_event_line_liability_id
  ON fund_event_line(liability_id);
