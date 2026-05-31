-- Tabela de analytics: visitas e cliques
CREATE TABLE IF NOT EXISTS analytics_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  type       TEXT NOT NULL,      -- 'view' | 'click' | 'modal_open'
  page       TEXT,               -- 'links' | 'portfolio'
  data       TEXT,               -- JSON: { link, section, etc }
  session_id TEXT,               -- ID de sessão (localStorage)
  referrer   TEXT,               -- URL de origem
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
