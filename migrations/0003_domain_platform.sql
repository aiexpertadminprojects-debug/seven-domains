PRAGMA foreign_keys = ON;

-- Seven Domains owns the catalogue and retail pricing policy.
-- No prices are seeded: do not publish invented or stale registrar prices.
CREATE TABLE IF NOT EXISTS domain_tlds (
  tld TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN (0,1)),
  registrar_provider TEXT,
  wholesale_registration_paise INTEGER,
  retail_registration_paise INTEGER,
  wholesale_renewal_paise INTEGER,
  retail_renewal_paise INTEGER,
  currency TEXT NOT NULL DEFAULT 'INR',
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK(wholesale_registration_paise IS NULL OR wholesale_registration_paise >= 0),
  CHECK(retail_registration_paise IS NULL OR retail_registration_paise >= 0),
  CHECK(wholesale_renewal_paise IS NULL OR wholesale_renewal_paise >= 0),
  CHECK(retail_renewal_paise IS NULL OR retail_renewal_paise >= 0)
);

INSERT OR IGNORE INTO domain_tlds(tld,label) VALUES
('.com','Global'),
('.in','India'),
('.co.in','India Business'),
('.net','Network'),
('.org','Organisation'),
('.org.in','India Organisation');

-- A quote is informational until a payment gateway and live registrar are enabled.
CREATE TABLE IF NOT EXISTS domain_quotes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain_name TEXT NOT NULL,
  tld TEXT NOT NULL REFERENCES domain_tlds(tld),
  status TEXT NOT NULL DEFAULT 'unavailable_for_sale'
    CHECK(status IN ('unavailable_for_sale','quoted','expired','converted','cancelled')),
  registration_price_paise INTEGER,
  renewal_price_paise INTEGER,
  currency TEXT NOT NULL DEFAULT 'INR',
  availability_checked_at TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_domain_quotes_user ON domain_quotes(user_id,created_at);
CREATE INDEX IF NOT EXISTS idx_domain_quotes_domain ON domain_quotes(domain_name,created_at);

CREATE TABLE IF NOT EXISTS domain_order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  quote_id TEXT REFERENCES domain_quotes(id),
  domain_name TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'register' CHECK(action IN ('register','renew','transfer')),
  term_years INTEGER NOT NULL DEFAULT 1 CHECK(term_years BETWEEN 1 AND 10),
  registrar_provider TEXT,
  registrar_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending','payment_pending','paid','submitted','active','failed','refunded','cancelled')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_domain_order_items_order ON domain_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_domain_order_items_domain ON domain_order_items(domain_name);

CREATE TABLE IF NOT EXISTS registrar_audit_events (
  id TEXT PRIMARY KEY,
  order_item_id TEXT REFERENCES domain_order_items(id) ON DELETE SET NULL,
  provider TEXT,
  event_type TEXT NOT NULL,
  safe_message TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_registrar_audit_created ON registrar_audit_events(created_at);
