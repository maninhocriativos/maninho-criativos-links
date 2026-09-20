CREATE TABLE IF NOT EXISTS finance_alert_deliveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER NOT NULL REFERENCES cash_transactions(id),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('three_days_before')),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'sent', 'failed')),
  provider_id TEXT DEFAULT '',
  provider_error TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  sent_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (transaction_id, alert_type, channel)
);

CREATE INDEX IF NOT EXISTS idx_finance_alert_transaction
  ON finance_alert_deliveries(transaction_id, alert_type, channel);
