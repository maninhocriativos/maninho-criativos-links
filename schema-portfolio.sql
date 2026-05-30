-- Migração: tabela portfolio
CREATE TABLE IF NOT EXISTS portfolio (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  category    TEXT    NOT NULL DEFAULT 'Ensaio Fotográfico',
  description TEXT    DEFAULT '',
  image_url   TEXT    NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active   INTEGER DEFAULT 1,
  created_at  TEXT    DEFAULT (datetime('now'))
);

-- Seed: fotos do ensaio com IA (já convertidas para WebP)
INSERT INTO portfolio (title, category, image_url, order_index) VALUES
  ('Ensaio com IA', 'Ensaio Fotográfico', '/ensaio/foto-1.webp',  1),
  ('Ensaio com IA', 'Ensaio Fotográfico', '/ensaio/foto-2.webp',  2),
  ('Ensaio com IA', 'Ensaio Fotográfico', '/ensaio/foto-3.webp',  3),
  ('Ensaio com IA', 'Ensaio Fotográfico', '/ensaio/foto-4.webp',  4),
  ('Ensaio com IA', 'Ensaio Fotográfico', '/ensaio/foto-5.webp',  5),
  ('Ensaio com IA', 'Ensaio Fotográfico', '/ensaio/foto-6.webp',  6),
  ('Ensaio com IA', 'Ensaio Fotográfico', '/ensaio/foto-7.webp',  7),
  ('Ensaio com IA', 'Ensaio Fotográfico', '/ensaio/foto-8.webp',  8),
  ('Ensaio com IA', 'Ensaio Fotográfico', '/ensaio/foto-9.webp',  9),
  ('Ensaio com IA', 'Ensaio Fotográfico', '/ensaio/foto-10.webp', 10),
  ('Ensaio com IA', 'Ensaio Fotográfico', '/ensaio/foto-11.webp', 11),
  ('Ensaio com IA', 'Ensaio Fotográfico', '/ensaio/foto-12.webp', 12),
  ('Ensaio com IA', 'Ensaio Fotográfico', '/ensaio/foto-13.webp', 13),
  ('Ensaio com IA', 'Ensaio Fotográfico', '/ensaio/foto-14.webp', 14),
  ('Ensaio com IA', 'Ensaio Fotográfico', '/ensaio/foto-15.webp', 15),
  ('Ensaio com IA', 'Ensaio Fotográfico', '/ensaio/foto-16.webp', 16),
  ('Ensaio com IA', 'Ensaio Fotográfico', '/ensaio/foto-17.webp', 17),
  ('Ensaio com IA', 'Ensaio Fotográfico', '/ensaio/foto-18.webp', 18),
  ('Ensaio com IA', 'Ensaio Fotográfico', '/ensaio/foto-19.webp', 19),
  ('Ensaio com IA', 'Ensaio Fotográfico', '/ensaio/foto-20.webp', 20),
  ('Ensaio com IA', 'Ensaio Fotográfico', '/ensaio/foto-21.webp', 21),
  ('Ensaio com IA', 'Ensaio Fotográfico', '/ensaio/foto-22.webp', 22);
