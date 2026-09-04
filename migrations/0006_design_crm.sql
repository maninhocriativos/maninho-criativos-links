ALTER TABLE leads ADD COLUMN email TEXT DEFAULT '';
ALTER TABLE leads ADD COLUMN company TEXT DEFAULT '';
ALTER TABLE leads ADD COLUMN status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE leads ADD COLUMN value_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE leads ADD COLUMN internal_notes TEXT DEFAULT '';
ALTER TABLE leads ADD COLUMN updated_at TEXT DEFAULT '';

CREATE TABLE IF NOT EXISTS design_projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  title TEXT NOT NULL,
  service TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'briefing' CHECK (status IN ('briefing','creation','review','approved','delivered','paused','cancelled')),
  value_cents INTEGER NOT NULL DEFAULT 0,
  deadline TEXT,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS crm_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('lead','client','project','receipt')),
  entity_id INTEGER NOT NULL,
  action TEXT NOT NULL,
  details TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON design_projects(status, deadline);
CREATE INDEX IF NOT EXISTS idx_projects_client ON design_projects(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_entity ON crm_activities(entity_type, entity_id, created_at DESC);
