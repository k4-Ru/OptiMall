-- Step 5 feature-store quality checks
-- Optional variables:
--   SET @feature_date = CURDATE();
--   SET @window_days = 30;

SET @feature_date = COALESCE(@feature_date, CURDATE());

-- 1) Freshness and row count for target date
SELECT
  @feature_date AS feature_date,
  COUNT(*) AS rows_count,
  COUNT(DISTINCT user_id) AS users_count,
  COUNT(DISTINCT product_id) AS products_count,
  MIN(updated_at) AS earliest_update,
  MAX(updated_at) AS latest_update
FROM user_product_features_daily
WHERE feature_date = @feature_date;

-- 2) Null / zero profile checks
SELECT
  SUM(CASE WHEN request_count = 0 THEN 1 ELSE 0 END) AS rows_without_exposures,
  SUM(CASE WHEN (view_count + click_count + cart_count + purchase_count) = 0 THEN 1 ELSE 0 END) AS rows_without_activity,
  SUM(CASE WHEN embedding_similarity > 0 THEN 1 ELSE 0 END) AS rows_with_embedding_similarity,
  ROUND(AVG(embedding_similarity), 4) AS avg_embedding_similarity,
  ROUND(AVG(prior_ctr), 4) AS avg_prior_ctr,
  ROUND(AVG(prior_cvr), 4) AS avg_prior_cvr
FROM user_product_features_daily
WHERE feature_date = @feature_date;

-- 3) Top rows by interaction strength (sanity spot-check)
SELECT
  user_id,
  product_id,
  request_count,
  view_count,
  click_count,
  cart_count,
  purchase_count,
  embedding_similarity,
  prior_ctr,
  prior_cvr,
  updated_at
FROM user_product_features_daily
WHERE feature_date = @feature_date
ORDER BY (purchase_count * 5 + cart_count * 3 + click_count * 2 + view_count) DESC, request_count DESC
LIMIT 30;
