PRAGMA foreign_keys = ON;

-- Seven Domains independent registrar-core foundation.
-- These records are internal workflow intents only; they do NOT register domains
-- or claim registry connectivity/accreditation.
CREATE TABLE IF NOT EXISTS registrar_operations (
  id TEXT PRIMARY KEY,
  domain_name TEXT NOT NULL,
  tld TEXT NOT NULL REFERENCES domain_tlds(tld),
  operation TEXT NOT NULL CHECK(operation IN ('check','register','renew','transfer','update_nameservers')),
  term_years INTEGER NOT NULL DEFAULT 1 CHECK(term_years BETWEEN 1 AND 10),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK(status IN ('draft','blocked_no_registry_access','ready_for_authorized_adapter','submitted','succeeded','failed','cancelled')),
  execution_mode TEXT NOT NULL DEFAULT 'dry_run'
    CHECK(execution_mode IN ('dry_run','live')),
  requested_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  request_json TEXT NOT NULL DEFAULT '{}',
  result_json TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_registrar_operations_domain
  ON registrar_operations(domain_name, created_at);
CREATE INDEX IF NOT EXISTS idx_registrar_operations_status
  ON registrar_operations(status, created_at);

CREATE TABLE IF NOT EXISTS registrar_operation_events (
  id TEXT PRIMARY KEY,
  operation_id TEXT NOT NULL REFERENCES registrar_operations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  safe_message TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_registrar_operation_events_operation
  ON registrar_operation_events(operation_id, created_at);
