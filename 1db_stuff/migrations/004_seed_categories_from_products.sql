-- Seed categories table from distinct products.category values.
-- Safe to re-run due to UNIQUE(name) and ON DUPLICATE KEY UPDATE.

INSERT INTO categories (name, description)
SELECT DISTINCT
  TRIM(p.category) AS name,
  CONCAT('Auto-seeded from products category: ', TRIM(p.category)) AS description
FROM products p
WHERE p.category IS NOT NULL
  AND TRIM(p.category) <> ''
ON DUPLICATE KEY UPDATE
  description = VALUES(description);
