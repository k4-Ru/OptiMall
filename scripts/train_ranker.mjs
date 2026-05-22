import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import mysql from 'mysql2/promise';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function sigmoid(z) {
  if (z > 30) return 1;
  if (z < -30) return 0;
  return 1 / (1 + Math.exp(-z));
}

function dot(a, b) {
  let out = 0;
  for (let i = 0; i < a.length; i += 1) out += a[i] * b[i];
  return out;
}

function shuffle(arr, seed = 42) {
  // Deterministic shuffle (LCG)
  let state = seed >>> 0;
  function rand() {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  }
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function percentile(sortedVals, q) {
  if (!sortedVals.length) return 0;
  const idx = Math.min(sortedVals.length - 1, Math.max(0, Math.floor(q * (sortedVals.length - 1))));
  return sortedVals[idx];
}

function buildScaler(rows, featureKeys) {
  const stats = {};
  for (const key of featureKeys) {
    const vals = rows.map((r) => Number(r[key] || 0)).sort((a, b) => a - b);
    const p05 = percentile(vals, 0.05);
    const p95 = percentile(vals, 0.95);
    const span = Math.max(1e-6, p95 - p05);
    stats[key] = { p05, p95, span };
  }
  return stats;
}

function toVector(row, featureKeys, scaler) {
  const vec = [1.0]; // bias
  for (const key of featureKeys) {
    const value = Number(row[key] || 0);
    const st = scaler[key];
    const clipped = Math.min(st.p95, Math.max(st.p05, value));
    const normalized = (clipped - st.p05) / st.span;
    vec.push(Number.isFinite(normalized) ? normalized : 0);
  }
  return vec;
}

function labelFromRow(row) {
  const purchase = Number(row.purchase_count || 0) > 0 ? 1 : 0;
  const carted = Number(row.cart_count || 0) > 0 ? 1 : 0;
  return purchase ? 1 : (carted ? 0.6 : 0);
}

function binaryLabel(row) {
  return Number(row.purchase_count || 0) > 0 ? 1 : 0;
}

function aucScore(labels, scores) {
  const pairs = labels.map((y, i) => ({ y, s: scores[i] })).sort((a, b) => b.s - a.s);
  let pos = 0;
  let neg = 0;
  for (const p of pairs) {
    if (p.y > 0.5) pos += 1;
    else neg += 1;
  }
  if (!pos || !neg) return 0.5;

  let rankSum = 0;
  for (let i = 0; i < pairs.length; i += 1) {
    if (pairs[i].y > 0.5) rankSum += (i + 1);
  }
  const auc = (rankSum - (pos * (pos + 1)) / 2) / (pos * neg);
  return Number(Math.max(0, Math.min(1, auc)).toFixed(4));
}

function groupedRankingMetrics(rows, preds, k = 5) {
  const groups = new Map();
  for (let i = 0; i < rows.length; i += 1) {
    const r = rows[i];
    const key = `${r.feature_date}::${r.user_id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({
      y: binaryLabel(r),
      score: preds[i],
    });
  }

  let recallAtK = 0;
  let ndcgAtK = 0;
  let validGroups = 0;

  for (const items of groups.values()) {
    const positives = items.filter((x) => x.y > 0).length;
    if (!positives) continue;
    validGroups += 1;

    const ranked = [...items].sort((a, b) => b.score - a.score);
    const topK = ranked.slice(0, k);
    const hits = topK.reduce((s, x) => s + (x.y > 0 ? 1 : 0), 0);
    recallAtK += hits / positives;

    let dcg = 0;
    for (let i = 0; i < topK.length; i += 1) {
      const rel = topK[i].y > 0 ? 1 : 0;
      dcg += rel / Math.log2(i + 2);
    }

    let idcg = 0;
    const best = Math.min(k, positives);
    for (let i = 0; i < best; i += 1) {
      idcg += 1 / Math.log2(i + 2);
    }
    ndcgAtK += idcg > 0 ? (dcg / idcg) : 0;
  }

  if (!validGroups) return { recall_at_k: 0, ndcg_at_k: 0, groups: 0 };
  return {
    recall_at_k: Number((recallAtK / validGroups).toFixed(4)),
    ndcg_at_k: Number((ndcgAtK / validGroups).toFixed(4)),
    groups: validGroups,
  };
}

async function loadDataset(pool, windowDays, maxRows) {
  const [rows] = await pool.query(
    `
    SELECT
      feature_date,
      user_id,
      product_id,
      request_count,
      view_count,
      click_count,
      cart_count,
      purchase_count,
      search_count,
      days_since_last_event,
      category_affinity,
      price_affinity,
      popularity_score,
      embedding_similarity,
      prior_ctr,
      prior_cvr
    FROM user_product_features_daily
    JOIN users u ON u.id = user_product_features_daily.user_id
    WHERE feature_date >= CURDATE() - INTERVAL ? DAY
      AND COALESCE(u.is_flagged, 0) = 0
    ORDER BY feature_date ASC, user_id ASC, product_id ASC
    LIMIT ?
    `,
    [windowDays, maxRows]
  );
  return rows;
}

function trainLogistic(trainRows, featureKeys, scaler, cfg) {
  const dim = featureKeys.length + 1;
  const w = new Array(dim).fill(0);

  const epochs = cfg.epochs;
  const lr = cfg.lr;
  const l2 = cfg.l2;

  const indices = [...Array(trainRows.length).keys()];

  for (let epoch = 0; epoch < epochs; epoch += 1) {
    shuffle(indices, 1337 + epoch);
    for (const idx of indices) {
      const row = trainRows[idx];
      const x = toVector(row, featureKeys, scaler);
      const y = labelFromRow(row);
      const p = sigmoid(dot(w, x));
      const err = p - y;

      for (let j = 0; j < w.length; j += 1) {
        const grad = (err * x[j]) + (l2 * w[j]);
        w[j] -= lr * grad;
      }
    }
  }

  return w;
}

function evaluate(rows, weights, featureKeys, scaler) {
  const preds = rows.map((r) => sigmoid(dot(weights, toVector(r, featureKeys, scaler))));
  const labels = rows.map((r) => binaryLabel(r));

  const auc = aucScore(labels, preds);
  const ranking5 = groupedRankingMetrics(rows, preds, 5);
  const ranking10 = groupedRankingMetrics(rows, preds, 10);

  return {
    auc,
    recall_at_5: ranking5.recall_at_k,
    ndcg_at_5: ranking5.ndcg_at_k,
    recall_at_10: ranking10.recall_at_k,
    ndcg_at_10: ranking10.ndcg_at_k,
    eval_groups: ranking10.groups,
  };
}

async function main() {
  const host = requireEnv('DB_HOST');
  const port = Number(process.env.DB_PORT || 3306);
  const user = requireEnv('DB_USER');
  const password = process.env.DB_PASSWORD || '';
  const database = requireEnv('DB_NAME');

  const modelKey = String(process.env.MODEL_KEY || 'ranking_lr');
  const modelVersion = String(process.env.MODEL_VERSION || `${modelKey}_${new Date().toISOString().replace(/[:.]/g, '-')}`);
  const windowDays = Number(process.env.TRAIN_WINDOW_DAYS || 120);
  const maxRows = Number(process.env.TRAIN_MAX_ROWS || 50000);
  const valRatio = Number(process.env.TRAIN_VAL_RATIO || 0.2);
  const epochs = Number(process.env.TRAIN_EPOCHS || 25);
  const lr = Number(process.env.TRAIN_LR || 0.08);
  const l2 = Number(process.env.TRAIN_L2 || 0.0005);

  const featureKeys = [
    'request_count',
    'view_count',
    'click_count',
    'cart_count',
    'search_count',
    'days_since_last_event',
    'category_affinity',
    'price_affinity',
    'popularity_score',
    'embedding_similarity',
    'prior_ctr',
    'prior_cvr',
  ];
  const featureSchemaHash = crypto
    .createHash('sha256')
    .update(featureKeys.join(','))
    .digest('hex');

  const pool = await mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 5,
  });

  try {
    const rows = await loadDataset(pool, windowDays, maxRows);
    if (!rows.length) throw new Error('No rows found in user_product_features_daily for training window.');

    const split = Math.max(1, Math.min(rows.length - 1, Math.floor(rows.length * (1 - valRatio))));
    const trainRows = rows.slice(0, split);
    const valRows = rows.slice(split);

    const scaler = buildScaler(trainRows, featureKeys);
    const weights = trainLogistic(trainRows, featureKeys, scaler, { epochs, lr, l2 });

    const trainMetrics = evaluate(trainRows, weights, featureKeys, scaler);
    const valMetrics = evaluate(valRows, weights, featureKeys, scaler);

    const artifact = {
      model_key: modelKey,
      model_version: modelVersion,
      trained_at: new Date().toISOString(),
      training: {
        window_days: windowDays,
        max_rows: maxRows,
        train_rows: trainRows.length,
        val_rows: valRows.length,
        epochs,
        lr,
        l2,
      },
      features: featureKeys,
      scaler,
      weights,
      metrics: {
        train: trainMetrics,
        validation: valMetrics,
      },
      notes: 'Logistic ranking baseline trained from user_product_features_daily',
    };

    const modelsDir = path.resolve('artifacts/models');
    await fs.mkdir(modelsDir, { recursive: true });
    const artifactPath = path.join(modelsDir, `${modelVersion}.json`);
    await fs.writeFile(artifactPath, JSON.stringify(artifact, null, 2), 'utf8');

    await pool.query(
      `
      INSERT INTO model_registry
      (model_key, model_version, status, framework, artifact_uri, feature_schema_hash, train_window_start, train_window_end, metrics, notes)
      VALUES (?, ?, 'candidate', 'custom-logistic', ?, ?, NOW() - INTERVAL ? DAY, NOW(), ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        framework = VALUES(framework),
        artifact_uri = VALUES(artifact_uri),
        feature_schema_hash = VALUES(feature_schema_hash),
        train_window_start = VALUES(train_window_start),
        train_window_end = VALUES(train_window_end),
        metrics = VALUES(metrics),
        notes = VALUES(notes),
        updated_at = CURRENT_TIMESTAMP
      `,
      [
        modelKey,
        modelVersion,
        artifactPath,
        featureSchemaHash,
        windowDays,
        JSON.stringify(artifact.metrics),
        `${artifact.notes}; features=${featureKeys.join(',')}`,
      ]
    );

    console.log(JSON.stringify({
      ok: true,
      model_key: modelKey,
      model_version: modelVersion,
      artifact_path: artifactPath,
      train_rows: trainRows.length,
      val_rows: valRows.length,
      metrics: artifact.metrics,
    }));
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
