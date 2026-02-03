-- resources/migrations/012_cash.sql  (subtype of assets)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS cash (
  asset_id      TEXT PRIMARY KEY,  -- PK/FK -> assets.asset_id
  currency_code TEXT NOT NULL,     -- 'USD', etc.

  FOREIGN KEY (asset_id)
    REFERENCES assets(asset_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CHECK (length(currency_code) = 3),
  CHECK (currency_code GLOB '[A-Z][A-Z][A-Z]')
);
