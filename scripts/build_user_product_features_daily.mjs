import mysql from 'mysql2/promise';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function parseEmbedding(raw) {
  if (!raw) return null;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed) || !parsed.length) return null;
    const vec = parsed.map((n) => Number(n)).filter((n) => Number.isFinite(n));
    return vec.length ? vec : null;
  } catch {
    return null;
  }
}

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || !a.length || a.length !== b.length) return 0;
  let dot = 0;
  let a2 = 0;
  let b2 = 0;
  for (let i = 0; i < a.length; i += 1) {
    const x = Number(a[i] || 0);
    const y = Number(b[i] || 0);
    dot += x * y;
    a2 += x * x;
    b2 += y * y;
  }
  const d = Math.sqrt(a2) * Math.sqrt(b2);
  return d ? (dot / d) : 0;
}

function round4(n) {
  return Number(Number(n || 0).toFixed(4));
}

async function main() {
  const host = requireEnv('DB_HOST');
  const port = Number(process.env.DB_PORT || 3306);
  const user = requireEnv('DB_USER');
  const password = process.env.DB_PASSWORD || '';
  const database = requireEnv('DB_NAME');

  const featureDate = String(process.env.FEATURE_BUILD_DATE || new Date().toISOString().slice(0, 10));
  const windowDays = Number(process.env.FEATURE_BUILD_WINDOW_DAYS || 30);
  const pairLimit = Number(process.env.FEATURE_BUILD_LIMIT || 3000);

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
    const [pairs] = await pool.query(
      `
      SELECT user_id, product_id, MAX(created_at) AS last_seen
      FROM (
        SELECT ua.user_id, ua.product_id, ua.created_at
        FROM user_activity ua
        WHERE ua.user_id IS NOT NULL
          AND ua.product_id IS NOT NULL
          AND ua.created_at >= DATE_SUB(?, INTERVAL ? DAY)

        UNION ALL

        SELECT re.user_id, re.product_id, re.created_at
        FROM recommendation_exposures re
        WHERE re.user_id IS NOT NULL
          AND re.product_id IS NOT NULL
          AND re.created_at >= DATE_SUB(?, INTERVAL ? DAY)
      ) t
      GROUP BY user_id, product_id
      ORDER BY last_seen DESC
      LIMIT ?
      `,
      [featureDate, windowDays, featureDate, windowDays, pairLimit]
    );

    if (!pairs.length) {
      console.log('No user-product pairs found for feature build.');
      return;
    }

    const userIds = [...new Set(pairs.map((p) => Number(p.user_id || 0)).filter((n) => n > 0))];
    const productIds = [...new Set(pairs.map((p) => Number(p.product_id || 0)).filter((n) => n > 0))];

    const [userEmbRows] = userIds.length
      ? await pool.query(
        `SELECT user_id, embedding, embedding_model, embedding_dimension FROM user_embeddings WHERE user_id IN (${userIds.map(() => '?').join(',')})`,
        userIds
      )
      : [[]];

    const [productEmbRows] = productIds.length
      ? await pool.query(
        `SELECT product_id, embedding, embedding_model, embedding_dimension FROM product_embeddings WHERE product_id IN (${productIds.map(() => '?').join(',')})`,
        productIds
      )
      : [[]];

    const [productMetaRows] = productIds.length
      ? await pool.query(
        `SELECT product_id, popularity_score FROM product_metadata WHERE product_id IN (${productIds.map(() => '?').join(',')})`,
        productIds
      )
      : [[]];

    const [productRows] = productIds.length
      ? await pool.query(
        `SELECT id, category, price FROM products WHERE id IN (${productIds.map(() => '?').join(',')})`,
        productIds
      )
      : [[]];

    const userEmbMap = new Map(userEmbRows.map((r) => [Number(r.user_id), r]));
    const productEmbMap = new Map(productEmbRows.map((r) => [Number(r.product_id), r]));
    const productMetaMap = new Map(productMetaRows.map((r) => [Number(r.product_id), Number(r.popularity_score || 0)]));
    const productMap = new Map(productRows.map((r) => [Number(r.id), r]));

    const [userCategoryRows] = userIds.length
      ? await pool.query(
        `
        SELECT ua.user_id, LOWER(COALESCE(p.category, '')) AS category, COUNT(*) AS c
        FROM user_activity ua
        JOIN products p ON p.id = ua.product_id
        WHERE ua.user_id IN (${userIds.map(() => '?').join(',')})
          AND ua.created_at >= DATE_SUB(?, INTERVAL ? DAY)
        GROUP BY ua.user_id, LOWER(COALESCE(p.category, ''))
        `,
        [...userIds, featureDate, windowDays]
      )
      : [[]];

    const userCategoryTotals = new Map();
    const userCategoryCounts = new Map();
    for (const row of userCategoryRows) {
      const uid = Number(row.user_id || 0);
      const cat = String(row.category || '');
      const c = Number(row.c || 0);
      userCategoryTotals.set(uid, (userCategoryTotals.get(uid) || 0) + c);
      userCategoryCounts.set(`${uid}::${cat}`, c);
    }

    const [userPriceRows] = userIds.length
      ? await pool.query(
        `
        SELECT ua.user_id, AVG(COALESCE(p.price, 0)) AS avg_price
        FROM user_activity ua
        JOIN products p ON p.id = ua.product_id
        WHERE ua.user_id IN (${userIds.map(() => '?').join(',')})
          AND ua.created_at >= DATE_SUB(?, INTERVAL ? DAY)
        GROUP BY ua.user_id
        `,
        [...userIds, featureDate, windowDays]
      )
      : [[]];
    const userAvgPrice = new Map(userPriceRows.map((r) => [Number(r.user_id), Number(r.avg_price || 0)]));

    let applied = 0;
    let withEmbedding = 0;

    for (const pair of pairs) {
      const uid = Number(pair.user_id || 0);
      const pid = Number(pair.product_id || 0);
      if (!uid || !pid) continue;

      const [[act]] = await pool.query(
        `
        SELECT
          SUM(CASE WHEN event_type = 'view_product' THEN 1 ELSE 0 END) AS view_count,
          SUM(CASE WHEN event_type = 'click_product' THEN 1 ELSE 0 END) AS click_count,
          SUM(CASE WHEN event_type = 'add_to_cart' THEN 1 ELSE 0 END) AS cart_count,
          SUM(CASE WHEN event_type = 'purchase' THEN 1 ELSE 0 END) AS purchase_count,
          SUM(CASE WHEN event_type = 'search' THEN 1 ELSE 0 END) AS search_count,
          MAX(created_at) AS last_event_at
        FROM user_activity
        WHERE user_id = ?
          AND product_id = ?
          AND created_at >= DATE_SUB(?, INTERVAL ? DAY)
        `,
        [uid, pid, featureDate, windowDays]
      );

      const [[exp]] = await pool.query(
        `
        SELECT COUNT(*) AS request_count
        FROM recommendation_exposures
        WHERE user_id = ?
          AND product_id = ?
          AND created_at >= DATE_SUB(?, INTERVAL ? DAY)
        `,
        [uid, pid, featureDate, windowDays]
      );

      const [[out]] = await pool.query(
        `
        SELECT
          SUM(CASE WHEN outcome_type = 'clicked' THEN 1 ELSE 0 END) AS clicks,
          SUM(CASE WHEN outcome_type = 'purchased' THEN 1 ELSE 0 END) AS purchases,
          COUNT(*) AS outcomes
        FROM recommendation_outcomes
        WHERE user_id = ?
          AND product_id = ?
          AND created_at >= DATE_SUB(?, INTERVAL ? DAY)
        `,
        [uid, pid, featureDate, windowDays]
      );

      const product = productMap.get(pid) || {};
      const productCategory = String(product?.category || '').toLowerCase();
      const totalCatInteractions = Number(userCategoryTotals.get(uid) || 0);
      const userCatInteractions = Number(userCategoryCounts.get(`${uid}::${productCategory}`) || 0);
      const categoryAffinity = totalCatInteractions > 0 ? userCatInteractions / totalCatInteractions : 0;

      const avgPrice = Number(userAvgPrice.get(uid) || 0);
      const prodPrice = Number(product?.price || 0);
      const priceAffinity = (avgPrice > 0 && prodPrice > 0)
        ? clamp(1 - (Math.abs(prodPrice - avgPrice) / Math.max(avgPrice, 1)), 0, 1)
        : 0;

      const userEmb = userEmbMap.get(uid);
      const prodEmb = productEmbMap.get(pid);
      let embeddingSimilarity = 0;
      if (userEmb && prodEmb) {
        const userModel = String(userEmb.embedding_model || '');
        const prodModel = String(prodEmb.embedding_model || '');
        const userDim = Number(userEmb.embedding_dimension || 0);
        const prodDim = Number(prodEmb.embedding_dimension || 0);
        if (userModel && prodModel && userModel === prodModel && userDim > 0 && userDim === prodDim) {
          const u = parseEmbedding(userEmb.embedding);
          const p = parseEmbedding(prodEmb.embedding);
          if (u && p && u.length === p.length) {
            embeddingSimilarity = (cosineSimilarity(u, p) + 1) / 2;
          }
        }
      }

      if (embeddingSimilarity > 0) withEmbedding += 1;

      const requestCount = Number(exp?.request_count || 0);
      const clicks = Number(out?.clicks || 0);
      const purchases = Number(out?.purchases || 0);

      const priorCtr = requestCount > 0 ? clicks / requestCount : 0;
      const priorCvr = requestCount > 0 ? purchases / requestCount : 0;

      const lastEventAt = act?.last_event_at ? new Date(act.last_event_at) : null;
      const featureDateObj = new Date(`${featureDate}T00:00:00Z`);
      const daysSinceLastEvent = lastEventAt
        ? Math.max(0, Math.floor((featureDateObj.getTime() - lastEventAt.getTime()) / (1000 * 60 * 60 * 24)))
        : null;

      const payload = {
        model_match: userEmb && prodEmb ? String(userEmb.embedding_model || '') === String(prodEmb.embedding_model || '') : false,
        dimensions: {
          user: Number(userEmb?.embedding_dimension || 0),
          product: Number(prodEmb?.embedding_dimension || 0),
        },
        window_days: windowDays,
      };

      await pool.query(
        `
        INSERT INTO user_product_features_daily (
          feature_date, user_id, product_id,
          request_count, view_count, click_count, cart_count, purchase_count, search_count,
          last_event_at, days_since_last_event,
          category_affinity, price_affinity, popularity_score, embedding_similarity,
          prior_ctr, prior_cvr, feature_payload
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          request_count = VALUES(request_count),
          view_count = VALUES(view_count),
          click_count = VALUES(click_count),
          cart_count = VALUES(cart_count),
          purchase_count = VALUES(purchase_count),
          search_count = VALUES(search_count),
          last_event_at = VALUES(last_event_at),
          days_since_last_event = VALUES(days_since_last_event),
          category_affinity = VALUES(category_affinity),
          price_affinity = VALUES(price_affinity),
          popularity_score = VALUES(popularity_score),
          embedding_similarity = VALUES(embedding_similarity),
          prior_ctr = VALUES(prior_ctr),
          prior_cvr = VALUES(prior_cvr),
          feature_payload = VALUES(feature_payload),
          updated_at = CURRENT_TIMESTAMP
        `,
        [
          featureDate,
          uid,
          pid,
          requestCount,
          Number(act?.view_count || 0),
          Number(act?.click_count || 0),
          Number(act?.cart_count || 0),
          Number(act?.purchase_count || 0),
          Number(act?.search_count || 0),
          lastEventAt ? lastEventAt.toISOString().slice(0, 19).replace('T', ' ') : null,
          daysSinceLastEvent,
          round4(categoryAffinity),
          round4(priceAffinity),
          round4(productMetaMap.get(pid) || 0),
          round4(embeddingSimilarity),
          round4(priorCtr),
          round4(priorCvr),
          JSON.stringify(payload),
        ]
      );

      applied += 1;
    }

    const [[stats]] = await pool.query(
      `
      SELECT
        COUNT(*) AS rows_today,
        AVG(embedding_similarity) AS avg_embedding_similarity,
        SUM(CASE WHEN embedding_similarity > 0 THEN 1 ELSE 0 END) AS with_embedding_similarity,
        SUM(CASE WHEN request_count > 0 THEN 1 ELSE 0 END) AS with_exposure_history
      FROM user_product_features_daily
      WHERE feature_date = ?
      `,
      [featureDate]
    );

    console.log(JSON.stringify({
      feature_date: featureDate,
      window_days: windowDays,
      processed_pairs: applied,
      pairs_with_embedding_similarity: withEmbedding,
      table_rows_today: Number(stats?.rows_today || 0),
      avg_embedding_similarity: Number(Number(stats?.avg_embedding_similarity || 0).toFixed(4)),
      rows_with_embedding_similarity: Number(stats?.with_embedding_similarity || 0),
      rows_with_exposure_history: Number(stats?.with_exposure_history || 0),
    }));
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
