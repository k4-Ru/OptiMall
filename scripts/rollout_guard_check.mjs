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

  const windowDays = Number(process.env.ROLLOUT_GUARD_WINDOW_DAYS || 7);
  const minExposures = Number(process.env.ROLLOUT_GUARD_MIN_EXPOSURES || 30);
  const maxCtrDrop = Number(process.env.ROLLOUT_GUARD_MAX_CTR_DROP || 0.15);
  const maxPurchaseDrop = Number(process.env.ROLLOUT_GUARD_MAX_PURCHASE_DROP || 0.2);

  const pool = await mysql.createPool({ host, port, user, password, database, waitForConnections: true, connectionLimit: 3 });
  try {
    const [rows] = await pool.query(
      `SELECT
        e.strategy AS variant,
        COUNT(*) AS exposures,
        SUM(CASE WHEN o.outcome_type = 'clicked' THEN 1 ELSE 0 END) AS clicks,
        SUM(CASE WHEN o.outcome_type = 'purchased' THEN 1 ELSE 0 END) AS purchases
      FROM recommendation_exposures e
      LEFT JOIN recommendation_outcomes o ON o.exposure_id = e.id
      WHERE e.created_at >= NOW() - INTERVAL ? DAY
      GROUP BY e.strategy`,
      [windowDays]
    );

    const map = new Map(rows.map((r) => [String(r.variant), {
      exposures: Number(r.exposures || 0),
      ctr: Number(r.exposures ? Number(r.clicks || 0) / Number(r.exposures || 1) : 0),
      purchase_rate: Number(r.exposures ? Number(r.purchases || 0) / Number(r.exposures || 1) : 0),
    }]));

    const h = map.get('heuristic_v1') || { exposures: 0, ctr: 0, purchase_rate: 0 };
    const hy = map.get('hybrid_v1') || { exposures: 0, ctr: 0, purchase_rate: 0 };

    let shouldRollback = false;
    let reasons = [];

    if (h.exposures >= minExposures && hy.exposures >= minExposures) {
      if (h.ctr > 0) {
        const ctrDrop = (h.ctr - hy.ctr) / h.ctr;
        if (ctrDrop > maxCtrDrop) {
          shouldRollback = true;
          reasons.push(`CTR drop ${ctrDrop.toFixed(4)} > ${maxCtrDrop}`);
        }
      }
      if (h.purchase_rate > 0) {
        const purchaseDrop = (h.purchase_rate - hy.purchase_rate) / h.purchase_rate;
        if (purchaseDrop > maxPurchaseDrop) {
          shouldRollback = true;
          reasons.push(`Purchase rate drop ${purchaseDrop.toFixed(4)} > ${maxPurchaseDrop}`);
        }
      }
    } else {
      reasons.push('Insufficient exposures for guard decision');
    }

    console.log(JSON.stringify({
      ok: true,
      window_days: windowDays,
      thresholds: { minExposures, maxCtrDrop, maxPurchaseDrop },
      heuristic_v1: h,
      hybrid_v1: hy,
      should_rollback: shouldRollback,
      reasons,
    }, null, 2));

    if (shouldRollback) process.exit(2);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
