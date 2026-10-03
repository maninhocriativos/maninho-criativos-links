CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'finance')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'disabled')),
  email_verified_at TEXT,
  approved_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_admin_users_status ON admin_users(status, email);

ALTER TABLE admin_login_challenges ADD COLUMN user_id INTEGER REFERENCES admin_users(id);
ALTER TABLE admin_login_challenges ADD COLUMN purpose TEXT NOT NULL DEFAULT 'login'
  CHECK (purpose IN ('login', 'registration'));

ALTER TABLE admin_sessions ADD COLUMN user_id INTEGER REFERENCES admin_users(id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user ON admin_sessions(user_id, expires_at);
