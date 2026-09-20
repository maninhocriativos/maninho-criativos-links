CREATE TABLE IF NOT EXISTS client_contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  type TEXT NOT NULL CHECK (type IN ('email', 'phone')),
  value TEXT NOT NULL,
  normalized_value TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (client_id, type, normalized_value)
);

CREATE INDEX IF NOT EXISTS idx_client_contacts_client
  ON client_contacts(client_id, type, sort_order);

INSERT OR IGNORE INTO client_contacts
  (client_id, type, value, normalized_value, contact_name, is_primary, sort_order)
SELECT id, 'email', email, lower(trim(email)), name, 1, 0
FROM clients
WHERE trim(email) <> '';

INSERT OR IGNORE INTO client_contacts
  (client_id, type, value, normalized_value, contact_name, is_primary, sort_order)
SELECT id, 'phone', phone, lower(trim(phone)), name, 1, 0
FROM clients
WHERE trim(phone) <> '';
