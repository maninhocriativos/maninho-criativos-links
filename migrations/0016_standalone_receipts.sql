ALTER TABLE receipt_emails ADD COLUMN recipient_document TEXT DEFAULT '';
ALTER TABLE receipt_emails ADD COLUMN recipient_address TEXT DEFAULT '';
ALTER TABLE receipt_emails ADD COLUMN delivery_mode TEXT NOT NULL DEFAULT 'email'
  CHECK (delivery_mode IN ('email', 'standalone'));
