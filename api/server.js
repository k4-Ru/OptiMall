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
    return res.status(500).json({ error: 'Failed to sync user', details: error.message });
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

const PRODUCT_WITH_METADATA_SQL = `
  SELECT
    p.*,
    COALESCE(pm.popularity_score, 0) AS popularity_score,
    pm.tag_vector,
    pm.extra
  FROM products p
  LEFT JOIN product_metadata pm ON pm.product_id = p.id
`;



app.get('/api/products', async (_req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`${PRODUCT_WITH_METADATA_SQL} ORDER BY p.id DESC`);
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch products', details: error.message });
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

    return res.status(201).json({ message: 'Activity logged' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to log activity', details: error.message });
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

    const recommendation = await getRecommendations({
      budget: Number(budget),
      preferences,
      user_id: req.auth.dbUserId,
      products,
      activity_events: activityEvents,
      latest_event: latestEvent,
    }, { requestId: req.requestId });

    return res.status(200).json(recommendation);
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      route: '/api/recommendations',
      requestId: req.requestId,
      errorType: error?.type || 'INTERNAL_ERROR',
      message: error?.message || 'unknown error',
    }));
    return res.status(500).json({
      error: 'Failed to get recommendations',
      details: error.details || error.response?.data || error.message,
      request_id: req.requestId,
      error_type: error.type || 'INTERNAL_ERROR',
    });
  }
});



app.post('/api/intelligence/promotions', requireClerkAuth, ensureUserRecord, async (req, res) => {
  try {
    const result = await getPromotions(req.body || {}, { requestId: req.requestId });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to run promotional intelligence',
      details: error.details || error.response?.data || error.message,
      request_id: req.requestId,
      error_type: error.type || 'INTERNAL_ERROR',
    });
  }
});






app.post('/api/intelligence/realtime-recommendations', requireClerkAuth, ensureUserRecord, async (req, res) => {
  try {
    const result = await getRealtimeRecommendations(req.body || {}, { requestId: req.requestId });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to run realtime recommendation',
      details: error.details || error.response?.data || error.message,
      request_id: req.requestId,
      error_type: error.type || 'INTERNAL_ERROR',
    });
  }
});





app.post('/api/intelligence/bundle-optimize', requireClerkAuth, ensureUserRecord, async (req, res) => {
  try {
    const result = await getBundleOptimization(req.body || {}, { requestId: req.requestId });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to run bundle optimization',
      details: error.details || error.response?.data || error.message,
      request_id: req.requestId,
      error_type: error.type || 'INTERNAL_ERROR',
    });
  }
});






app.post('/api/intelligence/anomaly-check', requireClerkAuth, ensureUserRecord, async (req, res) => {
  try {
    const result = await getAnomalyCheck(req.body || {}, { requestId: req.requestId });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to run anomaly detection',
      details: error.details || error.response?.data || error.message,
      request_id: req.requestId,
      error_type: error.type || 'INTERNAL_ERROR',
    });
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

    const result = await getIntelligencePipeline(normalizedPayload, { requestId: req.requestId });
    return res.status(200).json(result);
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      route: '/api/intelligence/pipeline',
      requestId: req.requestId,
      errorType: error?.type || 'INTERNAL_ERROR',
      message: error?.message || 'unknown error',
    }));
    return res.status(500).json({
      error: 'Failed to run intelligence pipeline',
      details: error.details || error.response?.data || error.message,
      request_id: req.requestId,
      error_type: error.type || 'INTERNAL_ERROR',
    });
  }
});





app.use('/api', (_req, res) => {
  return res.status(404).json({ error: 'Not found' });
});

export default app;
