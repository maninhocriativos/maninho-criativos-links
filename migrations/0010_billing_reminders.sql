ALTER TABLE cash_transactions ADD COLUMN payment_url TEXT DEFAULT '';
ALTER TABLE cash_transactions ADD COLUMN reminder_enabled INTEGER NOT NULL DEFAULT 0 CHECK (reminder_enabled IN (0, 1));
ALTER TABLE cash_transactions ADD COLUMN reminder_email INTEGER NOT NULL DEFAULT 1 CHECK (reminder_email IN (0, 1));
ALTER TABLE cash_transactions ADD COLUMN reminder_sms INTEGER NOT NULL DEFAULT 0 CHECK (reminder_sms IN (0, 1));
ALTER TABLE cash_transactions ADD COLUMN reminder_whatsapp INTEGER NOT NULL DEFAULT 0 CHECK (reminder_whatsapp IN (0, 1));

CREATE TABLE IF NOT EXISTS billing_reminder_deliveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER NOT NULL REFERENCES cash_transactions(id),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp')),
  slot INTEGER NOT NULL CHECK (slot IN (1, 2, 3)),
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'sent', 'failed')),
  provider_id TEXT DEFAULT '',
  provider_error TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  sent_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (transaction_id, channel, slot)
);

CREATE INDEX IF NOT EXISTS idx_billing_reminder_due
  ON cash_transactions(due_date, status, type, reminder_enabled);
CREATE INDEX IF NOT EXISTS idx_billing_delivery_transaction
  ON billing_reminder_deliveries(transaction_id, created_at DESC);
