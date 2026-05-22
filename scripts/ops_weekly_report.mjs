import mysql from 'mysql2/promise';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

async function main() {
  const host = requireEnv('DB_HOST');
  const port = Number(process.env.DB_PORT || 3306);
  const user = requireEnv('DB_USER');
  const password = process.env.DB_PASSWORD || '';
  const database = requireEnv('DB_NAME');

  const windowDays = Number(process.env.WEEKLY_REPORT_WINDOW_DAYS || 7);

  const pool = await mysql.createPool({ host, port, user, password, database, waitForConnections: true, connectionLimit: 3 });
  try {
    const [activeModelRows] = await pool.query(
      `SELECT id, model_key, model_version, framework, activated_at, metrics
       FROM model_registry
       WHERE status = 'active'
       ORDER BY activated_at DESC, updated_at DESC
       LIMIT 1`
    );

    const [variantRows] = await pool.query(
      `SELECT
         e.strategy AS variant,
         COUNT(*) AS exposures,
         SUM(CASE WHEN o.outcome_type='clicked' THEN 1 ELSE 0 END) AS clicks,
         SUM(CASE WHEN o.outcome_type='carted' THEN 1 ELSE 0 END) AS carts,
         SUM(CASE WHEN o.outcome_type='purchased' THEN 1 ELSE 0 END) AS purchases
       FROM recommendation_exposures e
       LEFT JOIN recommendation_outcomes o ON o.exposure_id = e.id
       WHERE e.created_at >= NOW() - INTERVAL ? DAY
       GROUP BY e.strategy
       ORDER BY exposures DESC`,
      [windowDays]
    );

    const [inferenceRows] = await pool.query(
      `SELECT
         COUNT(*) AS inference_events,
         AVG(score) AS avg_score,
         SUM(CASE WHEN fallback_used = 1 THEN 1 ELSE 0 END) AS fallback_events
       FROM model_inference_logs
       WHERE created_at >= NOW() - INTERVAL ? DAY`,
      [windowDays]
    );

    const model = activeModelRows?.[0] || null;
    const variants = (variantRows || []).map((r) => {
      const exposures = Number(r.exposures || 0);
      const clicks = Number(r.clicks || 0);
      const carts = Number(r.carts || 0);
      const purchases = Number(r.purchases || 0);
      return {
        variant: r.variant,
        exposures,
        clicks,
        carts,
        purchases,
        ctr: exposures ? Number((clicks / exposures).toFixed(4)) : 0,
        cart_rate: exposures ? Number((carts / exposures).toFixed(4)) : 0,
        purchase_rate: exposures ? Number((purchases / exposures).toFixed(4)) : 0,
      };
    });

    let parsedMetrics = null;
    try {
      parsedMetrics = model?.metrics ? (typeof model.metrics === 'string' ? JSON.parse(model.metrics) : model.metrics) : null;
    } catch {
      parsedMetrics = null;
    }

    const inference = inferenceRows?.[0] || {};

    console.log(JSON.stringify({
      ok: true,
      window_days: windowDays,
      generated_at: new Date().toISOString(),
      active_model: model
        ? {
          id: Number(model.id || 0),
          model_key: model.model_key,
          model_version: model.model_version,
          framework: model.framework,
          activated_at: model.activated_at,
          metrics: parsedMetrics,
        }
        : null,
      variant_metrics: variants,
      inference_summary: {
        inference_events: Number(inference.inference_events || 0),
        avg_score: Number(Number(inference.avg_score || 0).toFixed(4)),
        fallback_events: Number(inference.fallback_events || 0),
      },
    }, null, 2));
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
