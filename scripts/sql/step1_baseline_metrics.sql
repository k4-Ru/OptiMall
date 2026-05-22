-- Step 1 baseline window metrics (default: last 14 days)
-- Update window as needed.

-- 1) CTR from recommendation exposures
SELECT
  COUNT(*) AS exposures,
  SUM(CASE WHEN clicked = 1 THEN 1 ELSE 0 END) AS clicks,
  ROUND(SUM(CASE WHEN clicked = 1 THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 4) AS ctr
FROM (
  SELECT
    rl.id,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM user_activity ua
        WHERE ua.clerk_user_id = rl.clerk_user_id
          AND ua.event_type = 'click_product'
          AND ua.created_at >= rl.created_at
          AND ua.created_at <= rl.created_at + INTERVAL 1 DAY
      ) THEN 1 ELSE 0
    END AS clicked
  FROM recommendation_logs rl
  WHERE rl.created_at >= NOW() - INTERVAL 14 DAY
) t;

-- 2) Add-to-cart rate after recommendation
SELECT
  COUNT(*) AS recommendation_events,
  SUM(CASE WHEN carted = 1 THEN 1 ELSE 0 END) AS cart_events,
  ROUND(SUM(CASE WHEN carted = 1 THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 4) AS add_to_cart_rate
FROM (
  SELECT
    rl.id,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM user_activity ua
        WHERE ua.clerk_user_id = rl.clerk_user_id
          AND ua.event_type = 'add_to_cart'
          AND ua.created_at >= rl.created_at
          AND ua.created_at <= rl.created_at + INTERVAL 1 DAY
      ) THEN 1 ELSE 0
    END AS carted
  FROM recommendation_logs rl
  WHERE rl.created_at >= NOW() - INTERVAL 14 DAY
) t;

-- 3) Purchase rate after recommendation
SELECT
  COUNT(*) AS recommendation_events,
  SUM(CASE WHEN purchased = 1 THEN 1 ELSE 0 END) AS purchase_events,
  ROUND(SUM(CASE WHEN purchased = 1 THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 4) AS purchase_rate
FROM (
  SELECT
    rl.id,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM user_activity ua
        WHERE ua.clerk_user_id = rl.clerk_user_id
          AND ua.event_type = 'purchase'
          AND ua.created_at >= rl.created_at
          AND ua.created_at <= rl.created_at + INTERVAL 1 DAY
      ) THEN 1 ELSE 0
    END AS purchased
  FROM recommendation_logs rl
  WHERE rl.created_at >= NOW() - INTERVAL 14 DAY
) t;

-- 4) Strategy mix and fallback rate from logs
SELECT
  model_name,
  COUNT(*) AS events,
  ROUND(COUNT(*) / NULLIF((SELECT COUNT(*) FROM recommendation_logs WHERE created_at >= NOW() - INTERVAL 14 DAY), 0), 4) AS share
FROM recommendation_logs
WHERE created_at >= NOW() - INTERVAL 14 DAY
GROUP BY model_name
ORDER BY events DESC;
