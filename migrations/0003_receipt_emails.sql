CREATE TABLE IF NOT EXISTS receipt_emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  payment_method TEXT DEFAULT '',
  receipt_date TEXT NOT NULL,
  scheduled_at TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'scheduled', 'cancelled', 'failed')),
  resend_id TEXT,
  provider_error TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_receipt_emails_created ON receipt_emails(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_receipt_emails_status ON receipt_emails(status, scheduled_at);
