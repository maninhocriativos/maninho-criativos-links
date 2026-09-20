ALTER TABLE cash_transactions ADD COLUMN expense_scope TEXT NOT NULL DEFAULT 'business'
  CHECK (expense_scope IN ('business','household'));

CREATE INDEX IF NOT EXISTS idx_cash_scope_due
  ON cash_transactions(expense_scope, due_date, status);
