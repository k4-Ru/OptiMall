-- OptiMall standalone product seed (100 rows)
-- Keeps image_path empty so you can map images later.

START TRANSACTION;

ALTER TABLE `products`
  ADD COLUMN IF NOT EXISTS `image_path` VARCHAR(255) NULL AFTER `tags`;

INSERT INTO `sellers` (`name`, `location`, `rating`) VALUES
('OptiMart Official', 'Metro Manila', 4.8),
('TechNest PH', 'Cebu City', 4.6),
('HomeLab Store', 'Davao City', 4.7),
('DailyGear Hub', 'Baguio City', 4.5),
('NextWave Retail', 'Palawan', 4.4);

WITH RECURSIVE seq AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM seq WHERE n < 100
)
INSERT INTO `products` (`seller_id`, `name`, `category`, `price`, `rating`, `stock`, `tags`, `image_path`)
SELECT
  ((n - 1) % 5) + 1 AS seller_id,
  CONCAT(
    ELT(((n - 1) % 5) + 1, 'Smart', 'Pro', 'Ultra', 'Eco', 'Prime'),
    ' ',
    ELT(((n - 1) % 5) + 1, 'Earbuds', 'Speaker', 'Bulb', 'Clock', 'Stand'),
    ' ',
    LPAD(n, 3, '0')
  ) AS name,
  ELT(((n - 1) % 4) + 1, 'Tech', 'Home', 'Lifestyle', 'Accessories') AS category,
  ROUND(199 + (n * 37.5), 2) AS price,
  ROUND(3.8 + ((n % 12) * 0.1), 1) AS rating,
  5 + (n % 45) AS stock,
  JSON_ARRAY(
    ELT(((n - 1) % 4) + 1, 'tech', 'home', 'lifestyle', 'accessories'),
    ELT(((n - 1) % 3) + 1, 'popular', 'trending', 'budget'),
    ELT(((n - 1) % 4) + 1, 'new', 'featured', 'value', 'daily')
  ) AS tags,
  NULL AS image_path
FROM seq;

COMMIT;
