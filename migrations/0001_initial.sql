CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT NOT NULL DEFAULT 'Maninho Criativos',
  bio TEXT DEFAULT 'Criatividade sem limites ✨',
  avatar_url TEXT DEFAULT '',
  bg_from TEXT DEFAULT '#0f0c29',
  bg_via TEXT DEFAULT '#302b63',
  bg_to TEXT DEFAULT '#24243e',
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT DEFAULT '🔗',
  color_from TEXT DEFAULT '#667eea',
  color_to TEXT DEFAULT '#764ba2',
  order_index INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1 CHECK (is_active IN (0, 1)),
  click_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS portfolio (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Ensaio Fotográfico',
  description TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  image_mobile_url TEXT DEFAULT '',
  project_url TEXT DEFAULT '',
  order_index INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  instagram TEXT,
  service TEXT,
  message TEXT,
  page TEXT DEFAULT 'links' CHECK (page IN ('links', 'portfolio')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('view', 'click', 'modal_open')),
  page TEXT CHECK (page IS NULL OR page IN ('links', 'portfolio')),
  data TEXT,
  session_id TEXT,
  referrer TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT NOT NULL,
  bucket INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (key, bucket)
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_links_active_order ON links(is_active, order_index, id);
CREATE INDEX IF NOT EXISTS idx_portfolio_active_order ON portfolio(is_active, order_index, id);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_type_created ON analytics_events(type, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

INSERT OR IGNORE INTO profile (id, name, bio) VALUES (1, 'Maninho Criativos', 'Criatividade sem limites ✨');
