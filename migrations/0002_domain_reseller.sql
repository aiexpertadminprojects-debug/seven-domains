PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS domain_quotes (
  id TEXT PRIMARY KEY,
  domain_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  availability TEXT NOT NULL CHECK(availability IN ('available','unavailable','unknown')),
  currency TEXT NOT NULL DEFAULT 'INR',
  registration_price_paise INTEGER CHECK(registration_price_paise IS NULL OR registration_price_paise >= 0),
  renewal_price_paise INTEGER CHECK(renewal_price_paise IS NULL OR renewal_price_paise >= 0),
  quote_expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_domain_quotes_name_created ON domain_quotes(domain_name, created_at);

CREATE TABLE IF NOT EXISTS domain_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  order_number TEXT NOT NULL UNIQUE,
  domain_name TEXT NOT NULL,
  term_years INTEGER NOT NULL DEFAULT 1 CHECK(term_years BETWEEN 1 AND 10),
  status TEXT NOT NULL DEFAULT 'awaiting_payment'
    CHECK(status IN ('awaiting_payment','payment_verified','registration_pending','registered','registration_failed','refund_pending','refunded','cancelled')),
  currency TEXT NOT NULL DEFAULT 'INR',
  total_paise INTEGER NOT NULL CHECK(total_paise >= 0),
  registrar_provider TEXT,
  registrar_order_ref TEXT,
  payment_provider TEXT,
  payment_order_ref TEXT,
  payment_ref TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  registered_at TEXT,
  expires_at TEXT,
  failure_code TEXT,
  failure_message TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_domain_orders_user_created ON domain_orders(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_domain_orders_status ON domain_orders(status);
CREATE INDEX IF NOT EXISTS idx_domain_orders_domain ON domain_orders(domain_name);

CREATE TABLE IF NOT EXISTS domain_order_events (
  id TEXT PRIMARY KEY,
  domain_order_id TEXT NOT NULL REFERENCES domain_orders(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_domain_order_events_order ON domain_order_events(domain_order_id, created_at);
