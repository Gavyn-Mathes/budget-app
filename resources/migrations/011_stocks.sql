-- resources/migrations/011_stocks.sql  (subtype of assets)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS stocks (
  asset_id TEXT PRIMARY KEY,   -- PK/FK -> assets.asset_id
  ticker   TEXT NOT NULL,      -- e.g., 'AAPL'

  FOREIGN KEY (asset_id)
    REFERENCES assets(asset_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CHECK (length(trim(ticker)) > 0),
  CHECK (length(ticker) <= 15)
);

CREATE INDEX IF NOT EXISTS idx_stocks_ticker ON stocks(ticker);
