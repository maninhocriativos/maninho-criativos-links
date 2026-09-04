CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  document TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  postal_code TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email COLLATE NOCASE);

ALTER TABLE receipt_emails ADD COLUMN client_id INTEGER REFERENCES clients(id);
CREATE INDEX IF NOT EXISTS idx_receipt_emails_client ON receipt_emails(client_id, created_at DESC);
