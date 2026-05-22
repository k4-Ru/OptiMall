import mysql from 'mysql2/promise';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function relDiff(a, b) {
  const x = Number(a || 0);
  const y = Number(b || 0);
  if (x === 0 && y === 0) return 0;
  return Math.abs(x - y) / Math.max(Math.abs(x), 1e-9);
}

async function main() {
  const host = requireEnv('DB_HOST');
  const port = Number(process.env.DB_PORT || 3306);
  const user = requireEnv('DB_USER');
  const password = process.env.DB_PASSWORD || '';
  const database = requireEnv('DB_NAME');

  const recentDays = Number(process.env.DRIFT_RECENT_DAYS || 7);
  const baselineDays = Number(process.env.DRIFT_BASELINE_DAYS || 28);
  const maxFeatureDrift = Number(process.env.DRIFT_MAX_FEATURE_REL_DIFF || 0.35);
  const maxLabelDrift = Number(process.env.DRIFT_MAX_LABEL_REL_DIFF || 0.30);

  const pool = await mysql.createPool({ host, port, user, password, database, waitForConnections: true, connectionLimit: 3 });

  try {
    const [recentRows] = await pool.query(
      `SELECT
        AVG(request_count) AS avg_request_count,
        AVG(click_count) AS avg_click_count,
        AVG(cart_count) AS avg_cart_count,
        AVG(purchase_count) AS avg_purchase_count,
        AVG(embedding_similarity) AS avg_embedding_similarity,
        AVG(prior_ctr) AS avg_prior_ctr,
        AVG(prior_cvr) AS avg_prior_cvr,
        AVG(CASE WHEN purchase_count > 0 THEN 1 ELSE 0 END) AS purchase_positive_rate,
        COUNT(*) AS rows_count
       FROM user_product_features_daily
       WHERE feature_date >= CURDATE() - INTERVAL ? DAY`,
      [recentDays]
    );

    const [baseRows] = await pool.query(
      `SELECT
        AVG(request_count) AS avg_request_count,
        AVG(click_count) AS avg_click_count,
        AVG(cart_count) AS avg_cart_count,
        AVG(purchase_count) AS avg_purchase_count,
        AVG(embedding_similarity) AS avg_embedding_similarity,
        AVG(prior_ctr) AS avg_prior_ctr,
        AVG(prior_cvr) AS avg_prior_cvr,
        AVG(CASE WHEN purchase_count > 0 THEN 1 ELSE 0 END) AS purchase_positive_rate,
        COUNT(*) AS rows_count
       FROM user_product_features_daily
       WHERE feature_date < CURDATE() - INTERVAL ? DAY
         AND feature_date >= CURDATE() - INTERVAL ? DAY`,
      [recentDays, baselineDays + recentDays]
    );

    const recent = recentRows?.[0] || {};
    const base = baseRows?.[0] || {};

    const features = [
      'avg_request_count',
      'avg_click_count',
      'avg_cart_count',
      'avg_purchase_count',
      'avg_embedding_similarity',
      'avg_prior_ctr',
      'avg_prior_cvr',
    ];

    const featureDrift = {};
    let severeFeatureDrift = false;
    for (const f of features) {
      const d = relDiff(recent[f], base[f]);
      featureDrift[f] = Number(d.toFixed(4));
      if (d > maxFeatureDrift) severeFeatureDrift = true;
    }

    const labelDrift = relDiff(recent.purchase_positive_rate, base.purchase_positive_rate);
    const severeLabelDrift = labelDrift > maxLabelDrift;

    const result = {
      ok: true,
      recent_days: recentDays,
      baseline_days: baselineDays,
      thresholds: {
        max_feature_rel_diff: maxFeatureDrift,
        max_label_rel_diff: maxLabelDrift,
      },
      rows: {
        recent: Number(recent.rows_count || 0),
        baseline: Number(base.rows_count || 0),
      },
      feature_drift_rel_diff: featureDrift,
      label_drift_rel_diff: Number(labelDrift.toFixed(4)),
      severe_feature_drift: severeFeatureDrift,
      severe_label_drift: severeLabelDrift,
      should_disable_model: severeFeatureDrift || severeLabelDrift,
    };

    console.log(JSON.stringify(result, null, 2));

    if (result.should_disable_model) process.exit(2);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
