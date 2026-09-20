ALTER TABLE cash_transactions ADD COLUMN payment_provider TEXT DEFAULT '';
ALTER TABLE cash_transactions ADD COLUMN infinitepay_order_nsu TEXT DEFAULT '';
ALTER TABLE cash_transactions ADD COLUMN infinitepay_invoice_slug TEXT DEFAULT '';
ALTER TABLE cash_transactions ADD COLUMN infinitepay_transaction_nsu TEXT DEFAULT '';
ALTER TABLE cash_transactions ADD COLUMN infinitepay_receipt_url TEXT DEFAULT '';
ALTER TABLE cash_transactions ADD COLUMN infinitepay_paid_amount_cents INTEGER;
ALTER TABLE cash_transactions ADD COLUMN infinitepay_capture_method TEXT DEFAULT '';
ALTER TABLE cash_transactions ADD COLUMN infinitepay_synced_at TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_cash_infinitepay_order
  ON cash_transactions(infinitepay_order_nsu)
  WHERE infinitepay_order_nsu <> '';

CREATE TABLE IF NOT EXISTS infinitepay_webhook_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_nsu TEXT NOT NULL UNIQUE,
  order_nsu TEXT NOT NULL,
  invoice_slug TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'verified', 'ignored', 'failed')),
  provider_error TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  processed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_infinitepay_webhook_status
  ON infinitepay_webhook_events(status, created_at);
