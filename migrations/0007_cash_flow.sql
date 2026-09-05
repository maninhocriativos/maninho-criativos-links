CREATE TABLE IF NOT EXISTS cash_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER REFERENCES clients(id),
  project_id INTEGER REFERENCES design_projects(id),
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  due_date TEXT NOT NULL,
  paid_date TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled')),
  payment_method TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cash_due ON cash_transactions(due_date, status);
CREATE INDEX IF NOT EXISTS idx_cash_type_status ON cash_transactions(type, status);
CREATE INDEX IF NOT EXISTS idx_cash_client ON cash_transactions(client_id, due_date DESC);
