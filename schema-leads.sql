-- Tabela de leads captados pelo modal de contato
CREATE TABLE IF NOT EXISTS leads (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  instagram   TEXT,
  service     TEXT,
  message     TEXT,
  page        TEXT DEFAULT 'links',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
