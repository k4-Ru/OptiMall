-- Backfill product_metadata so all products have a metadata row.
-- Safe to re-run: only inserts missing rows.

INSERT INTO product_metadata (product_id, popularity_score, tag_vector, extra)
SELECT
  p.id,
  LEAST(100, ROUND(COALESCE(p.rating, 0) * 20, 2)) AS popularity_score,
  p.tags AS tag_vector,
  JSON_OBJECT('seed_source', 'migration_003_backfill', 'seeded_at', NOW()) AS extra
FROM products p
LEFT JOIN product_metadata pm ON pm.product_id = p.id
WHERE pm.product_id IS NULL;
