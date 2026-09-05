ALTER TABLE cash_transactions ADD COLUMN recurrence_group TEXT;
ALTER TABLE cash_transactions ADD COLUMN recurrence_frequency TEXT NOT NULL DEFAULT 'once';
ALTER TABLE cash_transactions ADD COLUMN installment_number INTEGER;
ALTER TABLE cash_transactions ADD COLUMN installment_total INTEGER;
CREATE INDEX IF NOT EXISTS idx_cash_recurrence ON cash_transactions(recurrence_group, installment_number);
