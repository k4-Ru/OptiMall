-- Step 6 training dataset sanity checks
SET @window_days = COALESCE(@window_days, 120);

SELECT
  COUNT(*) AS total_rows,
  COUNT(DISTINCT feature_date) AS days,
  COUNT(DISTINCT user_id) AS users,
  COUNT(DISTINCT product_id) AS products,
  SUM(CASE WHEN purchase_count > 0 THEN 1 ELSE 0 END) AS positive_purchase_rows,
  SUM(CASE WHEN cart_count > 0 THEN 1 ELSE 0 END) AS positive_cart_rows,
  ROUND(AVG(prior_ctr), 4) AS avg_prior_ctr,
  ROUND(AVG(prior_cvr), 4) AS avg_prior_cvr,
  ROUND(AVG(embedding_similarity), 4) AS avg_embedding_similarity
FROM user_product_features_daily
WHERE feature_date >= CURDATE() - INTERVAL @window_days DAY;

SELECT
  feature_date,
  COUNT(*) AS rows_count,
  SUM(CASE WHEN purchase_count > 0 THEN 1 ELSE 0 END) AS purchase_positive_rows,
  SUM(CASE WHEN cart_count > 0 THEN 1 ELSE 0 END) AS cart_positive_rows
FROM user_product_features_daily
WHERE feature_date >= CURDATE() - INTERVAL @window_days DAY
GROUP BY feature_date
ORDER BY feature_date DESC
LIMIT 30;
