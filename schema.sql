-- Maninho Criativos — D1 Database Schema

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
  is_active INTEGER DEFAULT 1,
  click_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Seed: perfil padrão
INSERT OR IGNORE INTO profile (id, name, bio) VALUES (1, 'Maninho Criativos', 'Criatividade sem limites ✨');

-- Seed: links iniciais
INSERT INTO links (title, url, icon, color_from, color_to, order_index) VALUES
  ('Instagram', 'https://instagram.com/maninhocriativos', '📸', '#f09433', '#bc1888', 1),
  ('YouTube', 'https://youtube.com/@maninhocriativos', '▶️', '#FF0000', '#cc0000', 2),
  ('TikTok', 'https://tiktok.com/@maninhocriativos', '🎵', '#010101', '#69C9D0', 3),
  ('WhatsApp', 'https://wa.me/5500000000000', '💬', '#25D366', '#128C7E', 4),
  ('Portfolio', 'https://maninhocriativos.com', '🎨', '#667eea', '#764ba2', 5);
