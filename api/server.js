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
    pm.extra,
    s.name     AS seller_name,
    s.location AS seller_location,
    s.rating   AS seller_rating
  FROM products p
  LEFT JOIN product_metadata pm ON pm.product_id = p.id
  LEFT JOIN sellers s ON s.id = p.seller_id
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
    normalizedPayload.products = applyOutcomeBoost(normalizedPayload.products, normalizedPayload.activity_events);

    const result = await getIntelligencePipeline(normalizedPayload, { requestId: req.requestId });
    return res.status(200).json(result);
  } catch (error) {
    logRouteError('/api/intelligence/pipeline', req, error);
    return sendInternalError(res, req, 'Failed to run intelligence pipeline', error.type || 'INTERNAL_ERROR');
  }
});





app.use('/api', (_req, res) => {
  return res.status(404).json({ error: 'Not found' });
});

export default app;
