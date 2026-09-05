ALTER TABLE portfolio ADD COLUMN gallery_name TEXT DEFAULT '';
UPDATE portfolio SET gallery_name = title WHERE category = 'Ensaio Fotográfico' AND (gallery_name IS NULL OR gallery_name = '');
CREATE INDEX IF NOT EXISTS idx_portfolio_gallery ON portfolio(category, gallery_name, order_index);
