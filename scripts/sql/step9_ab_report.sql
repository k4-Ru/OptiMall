-- Step 9 A/B report (no migration required)
-- Uses recommendation_exposures + recommendation_outcomes
-- Optional variable override:
--   SET @window_days = 14;

SET @window_days = COALESCE(@window_days, 14);

-- 1) Variant volume split
SELECT
  strategy AS variant,
  COUNT(*) AS exposures,
  ROUND(COUNT(*) / NULLIF((SELECT COUNT(*) FROM recommendation_exposures WHERE created_at >= NOW() - INTERVAL @window_days DAY), 0), 4) AS exposure_share
FROM recommendation_exposures
WHERE created_at >= NOW() - INTERVAL @window_days DAY
GROUP BY strategy
ORDER BY exposures DESC;

-- 2) CTR / Cart rate / Purchase CVR by variant
SELECT
  e.strategy AS variant,
  COUNT(*) AS exposures,
  SUM(CASE WHEN o.outcome_type = 'clicked' THEN 1 ELSE 0 END) AS clicks,
  SUM(CASE WHEN o.outcome_type = 'carted' THEN 1 ELSE 0 END) AS carts,
  SUM(CASE WHEN o.outcome_type = 'purchased' THEN 1 ELSE 0 END) AS purchases,
  ROUND(SUM(CASE WHEN o.outcome_type = 'clicked' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 4) AS ctr,
  ROUND(SUM(CASE WHEN o.outcome_type = 'carted' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 4) AS cart_rate,
  ROUND(SUM(CASE WHEN o.outcome_type = 'purchased' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 4) AS purchase_rate,
  ROUND(SUM(CASE WHEN o.outcome_type = 'purchased' THEN 1 ELSE 0 END) / NULLIF(SUM(CASE WHEN o.outcome_type = 'clicked' THEN 1 ELSE 0 END), 0), 4) AS click_to_purchase_cvr
FROM recommendation_exposures e
LEFT JOIN recommendation_outcomes o ON o.exposure_id = e.id
WHERE e.created_at >= NOW() - INTERVAL @window_days DAY
GROUP BY e.strategy
ORDER BY exposures DESC;

-- 3) Daily trend by variant
SELECT
  DATE(e.created_at) AS day,
  e.strategy AS variant,
  COUNT(*) AS exposures,
  SUM(CASE WHEN o.outcome_type = 'clicked' THEN 1 ELSE 0 END) AS clicks,
  SUM(CASE WHEN o.outcome_type = 'carted' THEN 1 ELSE 0 END) AS carts,
  SUM(CASE WHEN o.outcome_type = 'purchased' THEN 1 ELSE 0 END) AS purchases,
  ROUND(SUM(CASE WHEN o.outcome_type = 'clicked' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 4) AS ctr,
  ROUND(SUM(CASE WHEN o.outcome_type = 'purchased' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 4) AS purchase_rate
FROM recommendation_exposures e
LEFT JOIN recommendation_outcomes o ON o.exposure_id = e.id
WHERE e.created_at >= NOW() - INTERVAL @window_days DAY
GROUP BY DATE(e.created_at), e.strategy
ORDER BY day DESC, variant;

-- 4) Optional: compare product-category outcomes by variant
SELECT
  e.strategy AS variant,
  COALESCE(p.category, 'Uncategorized') AS category,
  COUNT(*) AS exposures,
  SUM(CASE WHEN o.outcome_type = 'clicked' THEN 1 ELSE 0 END) AS clicks,
  SUM(CASE WHEN o.outcome_type = 'purchased' THEN 1 ELSE 0 END) AS purchases,
  ROUND(SUM(CASE WHEN o.outcome_type = 'clicked' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 4) AS ctr,
  ROUND(SUM(CASE WHEN o.outcome_type = 'purchased' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 4) AS purchase_rate
FROM recommendation_exposures e
LEFT JOIN recommendation_outcomes o ON o.exposure_id = e.id
LEFT JOIN products p ON p.id = e.product_id
WHERE e.created_at >= NOW() - INTERVAL @window_days DAY
GROUP BY e.strategy, COALESCE(p.category, 'Uncategorized')
HAVING exposures >= 10
ORDER BY variant, exposures DESC;
