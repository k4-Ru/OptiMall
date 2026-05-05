import express from 'express';
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

const app = express();
app.use(express.json());

app.get('/api/products', async (_req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
});

app.post('/api/activity', requireClerkAuth, async (req, res) => {
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
      [null, req.auth.userId, event_type, product_id, category_id, search_query, weight_score]
    );

    return res.status(201).json({ message: 'Activity logged' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to log activity', details: error.message });
  }
});

app.post('/api/recommendations', requireClerkAuth, async (req, res) => {
  try {
    const { budget, preferences = [] } = req.body || {};

    if (!budget || Number(budget) <= 0) {
      return res.status(400).json({ error: 'budget must be a positive number' });
    }

    const pool = getPool();
    const [products] = await pool.query('SELECT * FROM products WHERE stock > 0');

    const recommendation = await getRecommendations({
      budget: Number(budget),
      preferences,
      user_id: req.auth.userId,
      products,
    });

    return res.status(200).json(recommendation);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to get recommendations',
      details: error.response?.data || error.message,
    });
  }
});

app.post('/api/intelligence/promotions', requireClerkAuth, async (req, res) => {
  try {
    const result = await getPromotions(req.body || {});
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to run promotional intelligence',
      details: error.response?.data || error.message,
    });
  }
});

app.post('/api/intelligence/realtime-recommendations', requireClerkAuth, async (req, res) => {
  try {
    const result = await getRealtimeRecommendations(req.body || {});
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to run realtime recommendation',
      details: error.response?.data || error.message,
    });
  }
});

app.post('/api/intelligence/bundle-optimize', requireClerkAuth, async (req, res) => {
  try {
    const result = await getBundleOptimization(req.body || {});
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to run bundle optimization',
      details: error.response?.data || error.message,
    });
  }
});

app.post('/api/intelligence/anomaly-check', requireClerkAuth, async (req, res) => {
  try {
    const result = await getAnomalyCheck(req.body || {});
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to run anomaly detection',
      details: error.response?.data || error.message,
    });
  }
});

app.post('/api/intelligence/pipeline', requireClerkAuth, async (req, res) => {
  try {
    const result = await getIntelligencePipeline(req.body || {});
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to run intelligence pipeline',
      details: error.response?.data || error.message,
    });
  }
});

app.use('/api', (_req, res) => {
  return res.status(404).json({ error: 'Not found' });
});

export default app;
