import express from 'express';
import crypto from 'crypto';
import { requireClerkAuth } from './_lib/clerkAuth.js';
import { getPool } from './_lib/db.js';
import {
  getAnomalyCheck,
  getBundleOptimization,
  getIntelligencePipeline,
  getPromotions,
  getRealtimeRecommendations,
  getRecommendations,
} from './_lib/pythonService.js';
import { validatePipelinePayload } from '../shared/intelligenceContract.js';

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  const incomingRequestId = req.headers['x-request-id'];
  const requestId = typeof incomingRequestId === 'string' && incomingRequestId
    ? incomingRequestId
    : crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
});

function logRouteError(route, req, error, extra = {}) {
  console.error(JSON.stringify({
    level: 'error',
    route,
    requestId: req.requestId,
    errorType: error?.type || 'INTERNAL_ERROR',
    message: error?.message || 'unknown error',
    details: error?.details || error?.response?.data || null,
    ...extra,
  }));
}

function sendInternalError(res, req, message, errorType = 'INTERNAL_ERROR') {
  return res.status(500).json({
    error: message,
    request_id: req.requestId,
    error_type: errorType,
  });
}

async function ensureUserRecord(req, res, next) {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({ error: 'Unauthorized: missing user context' });
    }

    const pool = getPool();
    const claims = req.auth.claims || {};
    const email = claims.email || claims.email_address || null;
    const name = claims.name || [claims.first_name, claims.last_name].filter(Boolean).join(' ') || null;

    await pool.query(
      `INSERT INTO users (clerk_user_id, email, name)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         email = VALUES(email),
         name = VALUES(name)`,
      [req.auth.userId, email, name]
    );

    const [rows] = await pool.query('SELECT id FROM users WHERE clerk_user_id = ? LIMIT 1', [req.auth.userId]);
    req.auth.dbUserId = rows?.[0]?.id || null;
    return next();
  } catch (error) {
    logRouteError('auth/ensureUserRecord', req, error);
    return sendInternalError(res, req, 'Failed to sync user');
  }
}

async function getRecentUserActivity(pool, dbUserId) {
  if (!dbUserId) {
    return { activityEvents: [], latestEvent: null };
  }

  const [rows] = await pool.query(
    `SELECT event_type, product_id, search_query, created_at
     FROM user_activity
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 100`,
    [dbUserId]
  );

  const activityEvents = rows.map((row) => ({
    event_type: row.event_type,
    product_id: row.product_id,
    search_query: row.search_query,
  }));

  return {
    activityEvents,
    latestEvent: activityEvents[0] || null,
  };
}

function buildOutcomeBoostMap(products, activityEvents) {
  const productById = new Map(products.map((p) => [Number(p.id), p]));
  const categorySignal = new Map();
  const productSignal = new Map();
  const eventWeights = {
    view_product: 0.2,
    click_product: 0.8,
    add_to_cart: 1.8,
    purchase: 3.0,
    search: 0.3,
  };

  for (const event of activityEvents || []) {
    const pid = Number(event?.product_id || 0);
    const type = String(event?.event_type || '').toLowerCase();
    const weight = eventWeights[type] ?? 0.1;
    if (!pid) continue;

    productSignal.set(pid, (productSignal.get(pid) || 0) + weight);

    const category = String(productById.get(pid)?.category || '').toLowerCase();
    if (category) {
      categorySignal.set(category, (categorySignal.get(category) || 0) + weight);
    }
  }

  let maxScore = 1;
  for (const p of products) {
    const pid = Number(p.id || 0);
    const category = String(p.category || '').toLowerCase();
    const score = (productSignal.get(pid) || 0) + (categorySignal.get(category) || 0) * 0.35;
    maxScore = Math.max(maxScore, score);
  }

  const boosts = new Map();
  for (const p of products) {
    const pid = Number(p.id || 0);
    const category = String(p.category || '').toLowerCase();
    const score = (productSignal.get(pid) || 0) + (categorySignal.get(category) || 0) * 0.35;
    boosts.set(pid, Number((score / maxScore).toFixed(4)));
  }
  return boosts;
}

function applyOutcomeBoost(products, activityEvents) {
  const boosts = buildOutcomeBoostMap(products, activityEvents);
  return products.map((product) => ({
    ...product,
    outcome_boost: boosts.get(Number(product.id)) || 0,
  }));
}

async function safeWriteRecommendationLog(pool, payload) {
  try {
    await pool.query(
      `INSERT INTO recommendation_logs
       (clerk_user_id, user_id, source_event_type, source_product_id, recommendation_payload, model_name, latency_ms)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.clerk_user_id || null,
        payload.user_id || null,
        payload.source_event_type || null,
        payload.source_product_id || null,
        JSON.stringify(payload.recommendation_payload || {}),
        payload.model_name || null,
        payload.latency_ms || null,
      ]
    );
  } catch {
    // non-blocking analytics write
  }
}

async function refreshProductPopularityScore(pool, productId) {
  const pid = Number(productId || 0);
  if (!pid) return;

  await pool.query(
    `INSERT IGNORE INTO product_metadata (product_id, popularity_score, tag_vector, extra)
     VALUES (?, 0, NULL, JSON_OBJECT('source', 'auto_refresh'))`,
    [pid]
  );

  const [rows] = await pool.query(
    `SELECT
      COALESCE(SUM(
        CASE LOWER(event_type)
          WHEN 'view_product' THEN 0.4
          WHEN 'click_product' THEN 1.0
          WHEN 'add_to_cart' THEN 3.0
          WHEN 'purchase' THEN 5.0
          WHEN 'search' THEN 0.2
          ELSE 0.1
        END * COALESCE(weight_score, 1)
      ), 0) AS weighted_score
     FROM user_activity
     WHERE product_id = ?`,
    [pid]
  );

  const weightedScore = Number(rows?.[0]?.weighted_score || 0);
  const popularityScore = Math.min(100, Number((5 + weightedScore).toFixed(2)));

  await pool.query(
    `UPDATE product_metadata
     SET popularity_score = ?, updated_at = CURRENT_TIMESTAMP
     WHERE product_id = ?`,
    [popularityScore, pid]
  );
}

const PRODUCT_WITH_METADATA_SQL = `
  SELECT
    p.*,
    COALESCE(pm.popularity_score, 0) AS popularity_score,
    pm.tag_vector,
    pm.extra
  FROM products p
  LEFT JOIN product_metadata pm ON pm.product_id = p.id
`;



app.get('/api/products', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`${PRODUCT_WITH_METADATA_SQL} ORDER BY p.id DESC`);
    return res.status(200).json(rows);
  } catch (error) {
    logRouteError('/api/products', req, error);
    return sendInternalError(res, req, 'Failed to fetch products');
  }
});

app.get('/api/embeddings/status', async (req, res) => {
  try {
    const pool = getPool();
    const [[products]] = await pool.query('SELECT COUNT(*) AS total_products FROM products');
    const [[embeddings]] = await pool.query('SELECT COUNT(*) AS embedded_products FROM product_embeddings');
    const totalProducts = Number(products?.total_products || 0);
    const embeddedProducts = Number(embeddings?.embedded_products || 0);
    const coverage = totalProducts ? Number(((embeddedProducts / totalProducts) * 100).toFixed(2)) : 0;

    return res.status(200).json({
      total_products: totalProducts,
      embedded_products: embeddedProducts,
      pending_products: Math.max(0, totalProducts - embeddedProducts),
      coverage_percent: coverage,
    });
  } catch (error) {
    logRouteError('/api/embeddings/status', req, error);
    return sendInternalError(res, req, 'Failed to fetch embeddings status');
  }
});








app.post('/api/activity', requireClerkAuth, ensureUserRecord, async (req, res) => {
  try {
    const {
      event_type,
      product_id = null,
      category_id = null,
      search_query = null,
      weight_score = 1,
    } = req.body || {};

    if (!event_type) {
      return res.status(400).json({ error: 'event_type is required' });
    }

    const pool = getPool();
    await pool.query(
      `INSERT INTO user_activity (user_id, clerk_user_id, event_type, product_id, category_id, search_query, weight_score)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.auth.dbUserId, req.auth.userId, event_type, product_id, category_id, search_query, weight_score]
    );

    if (product_id) {
      await refreshProductPopularityScore(pool, product_id);
    }

    return res.status(201).json({ message: 'Activity logged' });
  } catch (error) {
    logRouteError('/api/activity', req, error);
    return sendInternalError(res, req, 'Failed to log activity');
  }
});

app.post('/api/recommendations', requireClerkAuth, ensureUserRecord, async (req, res) => {
  try {
    const { budget, preferences = [] } = req.body || {};

    if (!budget || Number(budget) <= 0) {
      return res.status(400).json({ error: 'budget must be a positive number' });
    }

    const pool = getPool();
    const [products] = await pool.query(`${PRODUCT_WITH_METADATA_SQL} WHERE p.stock > 0`);
    const { activityEvents, latestEvent } = await getRecentUserActivity(pool, req.auth.dbUserId);

    const boostedProducts = applyOutcomeBoost(products, activityEvents);
    const recommendation = await getRecommendations({
      budget: Number(budget),
      preferences,
      user_id: req.auth.dbUserId,
      products: boostedProducts,
      activity_events: activityEvents,
      latest_event: latestEvent,
    }, { requestId: req.requestId });

    await safeWriteRecommendationLog(pool, {
      clerk_user_id: req.auth.userId,
      user_id: req.auth.dbUserId,
      source_event_type: latestEvent?.event_type || null,
      source_product_id: latestEvent?.product_id || null,
      recommendation_payload: recommendation,
      model_name: 'recommendations_pipeline',
      latency_ms: null,
    });
    return res.status(200).json(recommendation);
  } catch (error) {
    logRouteError('/api/recommendations', req, error);
    return sendInternalError(res, req, 'Failed to get recommendations', error.type || 'INTERNAL_ERROR');
  }
});



app.post('/api/intelligence/promotions', requireClerkAuth, ensureUserRecord, async (req, res) => {
  try {
    const result = await getPromotions(req.body || {}, { requestId: req.requestId });
    return res.status(200).json(result);
  } catch (error) {
    logRouteError('/api/intelligence/promotions', req, error);
    return sendInternalError(res, req, 'Failed to run promotional intelligence', error.type || 'INTERNAL_ERROR');
  }
});






app.post('/api/intelligence/realtime-recommendations', requireClerkAuth, ensureUserRecord, async (req, res) => {
  try {
    const result = await getRealtimeRecommendations(req.body || {}, { requestId: req.requestId });
    return res.status(200).json(result);
  } catch (error) {
    logRouteError('/api/intelligence/realtime-recommendations', req, error);
    return sendInternalError(res, req, 'Failed to run realtime recommendation', error.type || 'INTERNAL_ERROR');
  }
});





app.post('/api/intelligence/bundle-optimize', requireClerkAuth, ensureUserRecord, async (req, res) => {
  try {
    const result = await getBundleOptimization(req.body || {}, { requestId: req.requestId });
    return res.status(200).json(result);
  } catch (error) {
    logRouteError('/api/intelligence/bundle-optimize', req, error);
    return sendInternalError(res, req, 'Failed to run bundle optimization', error.type || 'INTERNAL_ERROR');
  }
});






app.post('/api/intelligence/anomaly-check', requireClerkAuth, ensureUserRecord, async (req, res) => {
  try {
    const result = await getAnomalyCheck(req.body || {}, { requestId: req.requestId });
    return res.status(200).json(result);
  } catch (error) {
    logRouteError('/api/intelligence/anomaly-check', req, error);
    return sendInternalError(res, req, 'Failed to run anomaly detection', error.type || 'INTERNAL_ERROR');
  }
});







app.post('/api/intelligence/pipeline', requireClerkAuth, ensureUserRecord, async (req, res) => {
  try {
    const validated = validatePipelinePayload(req.body || {});
    if (!validated.ok) {
      return res.status(400).json({
        error: 'Invalid intelligence pipeline payload',
        details: validated.errors,
      });
    }

    const normalizedPayload = validated.payload;
    const pool = getPool();

    if (!normalizedPayload.products.length) {
      const [products] = await pool.query(`${PRODUCT_WITH_METADATA_SQL} WHERE p.stock > 0`);
      normalizedPayload.products = products;
    }

    if (!normalizedPayload.activity_events?.length) {
      const { activityEvents, latestEvent } = await getRecentUserActivity(pool, req.auth.dbUserId);
      normalizedPayload.activity_events = activityEvents;
      normalizedPayload.latest_event = normalizedPayload.latest_event || latestEvent;
    }
    const hasActivityContext = Array.isArray(normalizedPayload.activity_events) && normalizedPayload.activity_events.length > 0;
    normalizedPayload.products = applyOutcomeBoost(normalizedPayload.products, normalizedPayload.activity_events);

    const result = await getIntelligencePipeline(normalizedPayload, { requestId: req.requestId });
    const responsePayload = {
      ...result,
      meta: {
        ...(result?.meta || {}),
        has_activity_context: hasActivityContext,
      },
    };

    await safeWriteRecommendationLog(pool, {
      clerk_user_id: req.auth.userId,
      user_id: req.auth.dbUserId,
      source_event_type: normalizedPayload?.latest_event?.event_type || null,
      source_product_id: normalizedPayload?.latest_event?.product_id || null,
      recommendation_payload: responsePayload,
      model_name: 'intelligence_pipeline',
      latency_ms: null,
    });

    return res.status(200).json(responsePayload);
  } catch (error) {
    logRouteError('/api/intelligence/pipeline', req, error);
    return sendInternalError(res, req, 'Failed to run intelligence pipeline', error.type || 'INTERNAL_ERROR');
  }
});

app.get('/api/products/:id/related', async (req, res) => {
  try {
    const productId = Number(req.params.id || 0);
    if (!productId) return res.status(400).json({ error: 'Invalid product id' });

    const pool = getPool();
    const [rows] = await pool.query(
      `
      SELECT
        p.*,
        pr.relationship_type,
        pr.strength_score
      FROM product_relationships pr
      JOIN products p ON p.id = pr.related_product_id
      WHERE pr.product_id = ?
      ORDER BY pr.strength_score DESC, p.rating DESC
      LIMIT 12
      `,
      [productId]
    );
    return res.status(200).json(rows);
  } catch (error) {
    logRouteError('/api/products/:id/related', req, error);
    return sendInternalError(res, req, 'Failed to fetch related products');
  }
});

app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const productId = Number(req.params.id || 0);
    if (!productId) return res.status(400).json({ error: 'Invalid product id' });

    const pool = getPool();
    const [rows] = await pool.query(
      `
      SELECT
        r.id,
        r.product_id,
        r.rating,
        r.review_text,
        r.sentiment_label,
        r.sentiment_score,
        r.helpful_count,
        r.created_at,
        COALESCE(NULLIF(u.name, ''), u.email, 'OptiMall User') AS reviewer_name
      FROM product_reviews r
      LEFT JOIN users u ON u.id = r.user_id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
      LIMIT 20
      `,
      [productId]
    );
    return res.status(200).json(rows);
  } catch (error) {
    logRouteError('/api/products/:id/reviews', req, error);
    return sendInternalError(res, req, 'Failed to fetch product reviews');
  }
});

app.post('/api/bundles/save', requireClerkAuth, ensureUserRecord, async (req, res) => {
  try {
    const {
      name = 'Smart Bundle',
      description = null,
      bundle_type = 'study',
      items = [],
      estimated_total_price = 0,
    } = req.body || {};

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: 'items must be a non-empty array' });
    }

    const allowedTypes = new Set(['gaming', 'study', 'travel', 'fitness', 'creator', 'smart_home', 'kitchen']);
    const safeType = allowedTypes.has(String(bundle_type)) ? String(bundle_type) : 'study';
    const safeName = String(name || 'Smart Bundle').slice(0, 255);
    const safeDesc = description == null ? null : String(description);
    const safeTotal = Number(estimated_total_price || 0);

    const normalizedItems = items
      .map((item) => ({
        product_id: Number(item?.product_id || item?.id || 0),
        quantity: Math.max(1, Number(item?.quantity || item?.qty || 1)),
      }))
      .filter((item) => item.product_id > 0);

    if (!normalizedItems.length) {
      return res.status(400).json({ error: 'No valid bundle items' });
    }

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [insertBundle] = await conn.query(
        `INSERT INTO bundles (name, description, bundle_type, estimated_total_price)
         VALUES (?, ?, ?, ?)`,
        [safeName, safeDesc, safeType, safeTotal]
      );
      const bundleId = Number(insertBundle?.insertId || 0);
      for (const item of normalizedItems) {
        await conn.query(
          `INSERT INTO bundle_items (bundle_id, product_id, quantity) VALUES (?, ?, ?)`,
          [bundleId, item.product_id, item.quantity]
        );
      }
      await conn.commit();
      return res.status(201).json({ id: bundleId, items_saved: normalizedItems.length });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    logRouteError('/api/bundles/save', req, error);
    return sendInternalError(res, req, 'Failed to save bundle');
  }
});





app.use('/api', (_req, res) => {
  return res.status(404).json({ error: 'Not found' });
});

export default app;
