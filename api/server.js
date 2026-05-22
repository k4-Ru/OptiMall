import express from 'express';
import crypto from 'crypto';
import fs from 'node:fs/promises';
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
const ALLOWED_ORIGINS = String(process.env.API_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin) return next();
  if (!ALLOWED_ORIGINS.length || ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-Id');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') return res.status(204).end();
  }
  return next();
});
app.use((req, res, next) => {
  const incomingRequestId = req.headers['x-request-id'];
  const requestId = typeof incomingRequestId === 'string' && incomingRequestId
    ? incomingRequestId
    : crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
});

const FALLBACK_ALERT_THRESHOLD = 0.02;
const fallbackTelemetry = {
  started_at: Date.now(),
  total_requests: 0,
  fallback_requests: 0,
};
const modelArtifactCache = new Map();
const EXPERIMENT_HYBRID_PERCENT = Math.max(0, Math.min(100, Number(process.env.EXPERIMENT_HYBRID_PERCENT || 50)));

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

function normalizePrefs(preferences = []) {
  if (!Array.isArray(preferences)) return [];
  return preferences.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean);
}

function extractTags(raw) {
  if (Array.isArray(raw)) return raw.map((item) => String(item || '').toLowerCase());
  if (typeof raw !== 'string') return [];
  const trimmed = raw.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed.map((item) => String(item || '').toLowerCase());
  } catch {
    return trimmed.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
  }
  return [];
}

function scoreProductBase(product, preferences) {
  const category = String(product?.category || '').toLowerCase();
  const tags = Array.from(new Set([
    ...extractTags(product?.tags),
    ...extractTags(product?.tag_vector),
  ]));

  let prefBonus = 0;
  if (category && preferences.includes(category)) prefBonus += 2;
  prefBonus += preferences.reduce((sum, pref) => sum + (tags.includes(pref) ? 1 : 0), 0);

  const price = Number(product?.price || 0);
  const rating = Number(product?.rating || 0);
  const stock = Number(product?.stock || 0);
  const popularity = Number(product?.popularity_score || 0);
  const outcomeBoost = Number(product?.outcome_boost || 0);
  if (price <= 0 || stock <= 0) return 0;

  const priceFactor = 1 / Math.max(price, 1);
  const popularityBonus = Math.min(Math.max(popularity, 0), 100) * 0.03;
  const learnedOutcomeBonus = Math.max(0, Math.min(outcomeBoost, 1)) * 2.2;
  return (rating * 1.5) + (priceFactor * 30) + prefBonus + popularityBonus + learnedOutcomeBonus;
}

function eventBoost(type) {
  const key = String(type || '').toLowerCase();
  if (key === 'view_product') return 0.5;
  if (key === 'click_product') return 1.0;
  if (key === 'add_to_cart') return 2.0;
  if (key === 'purchase') return 3.0;
  if (key === 'search') return 0.8;
  return 0.0;
}

function runLocalHeuristicPipeline(payload) {
  const prefs = normalizePrefs(payload?.preferences || []);
  const products = Array.isArray(payload?.products) ? payload.products : [];
  const activityEvents = Array.isArray(payload?.activity_events) ? payload.activity_events : [];
  const latestEvent = payload?.latest_event || {};
  const budget = Number(payload?.budget || 0);

  const interactionBoostByProduct = new Map();
  for (const event of activityEvents) {
    const pid = Number(event?.product_id || 0);
    if (!pid) continue;
    const boost = eventBoost(event?.event_type);
    interactionBoostByProduct.set(pid, (interactionBoostByProduct.get(pid) || 0) + boost);
  }

  const promoted = products
    .map((product) => {
      const id = Number(product?.id || 0);
      const baseScore = scoreProductBase(product, prefs);
      return {
        product,
        promotion_score: Number((baseScore + (interactionBoostByProduct.get(id) || 0)).toFixed(3)),
      };
    })
    .filter((row) => row.promotion_score > 0)
    .sort((a, b) => b.promotion_score - a.promotion_score)
    .slice(0, 20);

  const latestType = String(latestEvent?.event_type || '').toLowerCase();
  const latestPid = Number(latestEvent?.product_id || 0);
  const realtime = promoted
    .map((item) => {
      const category = String(item?.product?.category || '').toLowerCase();
      let score = Number(item?.promotion_score || 0);
      if (latestPid && Number(item?.product?.id || 0) === latestPid) {
        if (latestType === 'click_product' || latestType === 'add_to_cart') score += 2.0;
        else if (latestType === 'view_product') score += 1.0;
      }
      if (category && prefs.includes(category)) score += 0.5;
      return {
        product: item.product,
        realtime_score: Number(score.toFixed(3)),
      };
    })
    .sort((a, b) => b.realtime_score - a.realtime_score)
    .slice(0, 20);

  const bundleCandidates = realtime
    .map((item) => ({
      product: item.product,
      score: Number(item.realtime_score || 0),
      price: Number(item?.product?.price || 0),
    }))
    .filter((item) => item.price > 0 && item.score > 0 && Number(item?.product?.stock || 0) > 0)
    .sort((a, b) => (b.score / b.price) - (a.score / a.price));

  const bundle = [];
  let totalCost = 0;
  let totalScore = 0;
  for (const candidate of bundleCandidates) {
    if (totalCost + candidate.price > budget) continue;
    totalCost += candidate.price;
    totalScore += candidate.score;
    bundle.push({
      id: candidate.product.id,
      name: candidate.product.name,
      price: candidate.price,
      category: candidate.product.category,
      image_path: candidate.product.image_path || null,
      stock: candidate.product.stock,
      score: Number(candidate.score.toFixed(3)),
    });
  }

  const addToCartCount = activityEvents.filter((e) => String(e?.event_type || '').toLowerCase() === 'add_to_cart').length;
  const purchaseCount = activityEvents.filter((e) => String(e?.event_type || '').toLowerCase() === 'purchase').length;
  const searchCount = activityEvents.filter((e) => String(e?.event_type || '').toLowerCase() === 'search').length;
  let riskScore = 0;
  const reasons = [];
  if (addToCartCount > 20) {
    riskScore += 30;
    reasons.push('Unusually high add_to_cart volume');
  }
  if (purchaseCount > 10) {
    riskScore += 20;
    reasons.push('Unusually high purchase volume');
  }
  if (searchCount > 50) {
    riskScore += 10;
    reasons.push('Excessive search activity');
  }
  if (totalCost > 50000) {
    riskScore += 40;
    reasons.push('High-value order total');
  }
  const riskLevel = riskScore >= 60 ? 'high' : riskScore >= 30 ? 'medium' : 'low';

  return {
    promotional_engine: {
      promoted_products: promoted,
      engine: 'promotional_intelligence',
    },
    realtime_recommendation: {
      suggestions: realtime,
      engine: 'realtime_recommendation',
    },
    bundle_optimization: {
      budget,
      total_cost: Number(totalCost.toFixed(2)),
      remaining_budget: Number((budget - totalCost).toFixed(2)),
      bundle,
      bundle_score: Number(totalScore.toFixed(3)),
      engine: 'bundle_optimization',
      strategy: 'greedy_ratio',
    },
    anomaly_detection: {
      risk_level: riskLevel,
      risk_score: riskScore,
      reasons,
      engine: 'anomaly_detection',
    },
  };
}

function recordFallbackTelemetry(route, usedFallback) {
  fallbackTelemetry.total_requests += 1;
  if (usedFallback) fallbackTelemetry.fallback_requests += 1;
  const rate = fallbackTelemetry.total_requests > 0
    ? fallbackTelemetry.fallback_requests / fallbackTelemetry.total_requests
    : 0;
  if (rate > FALLBACK_ALERT_THRESHOLD) {
    console.warn(JSON.stringify({
      level: 'warn',
      route,
      type: 'fallback_rate_high',
      threshold: FALLBACK_ALERT_THRESHOLD,
      fallback_rate: Number(rate.toFixed(4)),
      total_requests: fallbackTelemetry.total_requests,
      fallback_requests: fallbackTelemetry.fallback_requests,
      started_at: new Date(fallbackTelemetry.started_at).toISOString(),
    }));
  }
}

async function ensureUserRecord(req, res, next) {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({ error: 'Unauthorized: missing user context' });
    }

    const pool = getPool();
    const experiment = resolveExperimentVariant(req.auth?.userId || req.auth?.dbUserId || req.requestId);
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

    const [rows] = await pool.query(
      'SELECT id, role, is_flagged, flagged_at, flag_reason FROM users WHERE clerk_user_id = ? LIMIT 1',
      [req.auth.userId]
    );
    req.auth.dbUserId = rows?.[0]?.id || null;
    req.auth.role = String(rows?.[0]?.role || 'customer').toLowerCase();
    req.auth.isFlagged = Number(rows?.[0]?.is_flagged || 0) === 1;
    req.auth.flaggedAt = rows?.[0]?.flagged_at || null;
    req.auth.flagReason = rows?.[0]?.flag_reason || null;
    if (req.auth.isFlagged) {
      return res.status(403).json({
        error: 'Suspicious activity detected. Access restricted.',
        error_type: 'SUSPICIOUS_USER_BLOCKED',
        flagged_at: req.auth.flaggedAt,
        flag_reason: req.auth.flagReason || 'suspicious_activity',
        request_id: req.requestId,
      });
    }
    return next();
  } catch (error) {
    logRouteError('auth/ensureUserRecord', req, error);
    return sendInternalError(res, req, 'Failed to sync user');
  }
}

function requireAdmin(req, res, next) {
  const role = String(req.auth?.role || '').toLowerCase();
  if (role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden: admin access required',
      error_type: 'ADMIN_REQUIRED',
      request_id: req.requestId,
    });
  }
  return next();
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
    created_at: row.created_at || null,
  }));

  return {
    activityEvents,
    latestEvent: activityEvents[0] || null,
  };
}

async function getUserAbuseSnapshot(pool, userId) {
  const uid = Number(userId || 0);
  if (!uid) {
    return {
      add_to_cart_1m: 0,
      add_to_cart_10m: 0,
      purchase_10m: 0,
      purchase_1h: 0,
      orders_24h: 0,
      spend_24h: 0,
    };
  }

  const [[events]] = await pool.query(
    `SELECT
       SUM(CASE WHEN event_type = 'add_to_cart' AND created_at >= NOW() - INTERVAL 1 MINUTE THEN 1 ELSE 0 END) AS add_to_cart_1m,
       SUM(CASE WHEN event_type = 'add_to_cart' AND created_at >= NOW() - INTERVAL 10 MINUTE THEN 1 ELSE 0 END) AS add_to_cart_10m,
       SUM(CASE WHEN event_type = 'purchase' AND created_at >= NOW() - INTERVAL 10 MINUTE THEN 1 ELSE 0 END) AS purchase_10m,
       SUM(CASE WHEN event_type = 'purchase' AND created_at >= NOW() - INTERVAL 1 HOUR THEN 1 ELSE 0 END) AS purchase_1h
     FROM user_activity
     WHERE user_id = ?
       AND user_id IN (SELECT id FROM users WHERE COALESCE(is_flagged, 0) = 0)`,
    [uid]
  );

  const [[orders]] = await pool.query(
    `SELECT
       COUNT(*) AS orders_24h,
       COALESCE(SUM(total_amount), 0) AS spend_24h
     FROM orders
     WHERE user_id = ?
       AND user_id IN (SELECT id FROM users WHERE COALESCE(is_flagged, 0) = 0)
       AND created_at >= NOW() - INTERVAL 24 HOUR`,
    [uid]
  );

  return {
    add_to_cart_1m: Number(events?.add_to_cart_1m || 0),
    add_to_cart_10m: Number(events?.add_to_cart_10m || 0),
    purchase_10m: Number(events?.purchase_10m || 0),
    purchase_1h: Number(events?.purchase_1h || 0),
    orders_24h: Number(orders?.orders_24h || 0),
    spend_24h: Number(orders?.spend_24h || 0),
  };
}

function detectAbuseBlock(snapshot, context = {}) {
  const kind = String(context.kind || '');
  const checkoutItems = Number(context.checkout_items || 0);
  const checkoutTotal = Number(context.checkout_total || 0);

  if (kind === 'activity_add_to_cart') {
    if (snapshot.add_to_cart_1m >= 25) {
      return { blocked: true, reason: 'add_to_cart_spike_1m', retry_after_seconds: 120 };
    }
    if (snapshot.add_to_cart_10m >= 140) {
      return { blocked: true, reason: 'add_to_cart_spike_10m', retry_after_seconds: 300 };
    }
  }

  if (kind === 'activity_purchase') {
    if (snapshot.purchase_10m >= 8) {
      return { blocked: true, reason: 'purchase_spike_10m', retry_after_seconds: 300 };
    }
  }

  if (kind === 'checkout') {
    if (checkoutItems > 80) return { blocked: true, reason: 'checkout_item_volume_too_high', retry_after_seconds: 300 };
    if (checkoutTotal > 250000) return { blocked: true, reason: 'checkout_value_too_high', retry_after_seconds: 300 };
    if (snapshot.add_to_cart_10m >= 160) return { blocked: true, reason: 'checkout_after_add_to_cart_spike', retry_after_seconds: 300 };
    if (snapshot.purchase_1h >= 15) return { blocked: true, reason: 'checkout_purchase_spike_1h', retry_after_seconds: 300 };
    if (snapshot.orders_24h >= 30) return { blocked: true, reason: 'checkout_order_count_24h_high', retry_after_seconds: 600 };
    if (snapshot.spend_24h >= 400000) return { blocked: true, reason: 'checkout_spend_24h_high', retry_after_seconds: 600 };
  }

  return { blocked: false };
}

async function flagUserAsSuspicious(pool, userId, reason) {
  const uid = Number(userId || 0);
  if (!uid) return;
  await pool.query(
    `UPDATE users
     SET is_flagged = 1,
         flagged_at = COALESCE(flagged_at, NOW()),
         flag_reason = COALESCE(flag_reason, ?)
     WHERE id = ?`,
    [String(reason || 'suspicious_activity').slice(0, 255), uid]
  );
  await revokeFlaggedUserSignals(pool, uid);
}

async function revokeFlaggedUserSignals(pool, userId) {
  const uid = Number(userId || 0);
  if (!uid) return;
  const [rows] = await pool.query(
    `SELECT DISTINCT product_id
     FROM user_activity
     WHERE user_id = ?
       AND product_id IS NOT NULL`,
    [uid]
  );
  const touchedProductIds = rows
    .map((row) => Number(row?.product_id || 0))
    .filter((id) => id > 0);
  for (const productId of touchedProductIds) {
    // Recompute from current non-flagged user activity only.
    await refreshProductPopularityScore(pool, productId);
  }
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

function parseEmbeddingVector(raw) {
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

function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) return 0;
  if (!vecA.length || !vecB.length || vecA.length !== vecB.length) return 0;
  let dot = 0;
  let a2 = 0;
  let b2 = 0;
  for (let i = 0; i < vecA.length; i += 1) {
    const a = Number(vecA[i] || 0);
    const b = Number(vecB[i] || 0);
    dot += a * b;
    a2 += a * a;
    b2 += b * b;
  }
  const denom = Math.sqrt(a2) * Math.sqrt(b2);
  if (!denom) return 0;
  return dot / denom;
}

function sigmoid(z) {
  if (z > 30) return 1;
  if (z < -30) return 0;
  return 1 / (1 + Math.exp(-z));
}

function dot(vecA, vecB) {
  let out = 0;
  const n = Math.min(vecA.length, vecB.length);
  for (let i = 0; i < n; i += 1) out += Number(vecA[i] || 0) * Number(vecB[i] || 0);
  return out;
}

function resolveExperimentVariant(stableKey) {
  const key = String(stableKey || 'anon');
  const digest = crypto.createHash('sha256').update(key).digest('hex');
  const bucket = parseInt(digest.slice(0, 8), 16) % 100;
  const variant = bucket < EXPERIMENT_HYBRID_PERCENT ? 'hybrid_v1' : 'heuristic_v1';
  return { variant, bucket };
}

function applyOutcomeBoost(products, activityEvents, userEmbedding = null) {
  const boosts = buildOutcomeBoostMap(products, activityEvents);
  const userVec = parseEmbeddingVector(userEmbedding?.embedding || null);
  const userModel = String(userEmbedding?.embedding_model || '');
  const userDim = Number(userEmbedding?.embedding_dimension || 0);

  return products.map((product) => ({
    ...product,
    outcome_boost: (() => {
      const behaviorBoost = Number(boosts.get(Number(product.id)) || 0);
      const productVec = parseEmbeddingVector(product?.embedding || null);
      const productModel = String(product?.embedding_model || '');
      const productDim = Number(product?.embedding_dimension || 0);

      const modelMatches = !!userVec && !!productVec && userModel && productModel && userModel === productModel;
      const dimMatches = !!userVec && !!productVec && userDim > 0 && productDim > 0 && userDim === productDim;
      let embeddingSimilarity = 0;
      if (modelMatches && dimMatches) {
        const cos = cosineSimilarity(userVec, productVec);
        embeddingSimilarity = Number((((cos + 1) / 2)).toFixed(4));
      }
      // Keep behavior as dominant signal, add bounded embedding lift.
      const combined = behaviorBoost + (embeddingSimilarity * 0.6);
      return Number(Math.min(1, Math.max(0, combined)).toFixed(4));
    })(),
  }));
}

function buildBundleSignature(items = []) {
  const normalized = (Array.isArray(items) ? items : [])
    .map((item) => ({
      product_id: Number(item?.product_id || item?.id || 0),
      quantity: Math.max(1, Number(item?.quantity || item?.qty || 1)),
    }))
    .filter((item) => item.product_id > 0)
    .sort((a, b) => (a.product_id - b.product_id) || (a.quantity - b.quantity));
  const base = normalized.map((item) => `${item.product_id}:${item.quantity}`).join('|');
  if (!base) return '';
  return crypto.createHash('sha256').update(base).digest('hex');
}

async function resolveBundleIdBySignature(connOrPool, userId, signature) {
  const uid = Number(userId || 0);
  const sig = String(signature || '').trim();
  if (!uid || !sig) return null;
  const [bundles] = await connOrPool.query(
    `SELECT id
     FROM bundles
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 500`,
    [uid]
  );
  const bundleIds = (bundles || []).map((row) => Number(row?.id || 0)).filter((id) => id > 0);
  if (!bundleIds.length) return null;
  const [rows] = await connOrPool.query(
    `SELECT bundle_id, product_id, quantity
     FROM bundle_items
     WHERE bundle_id IN (${bundleIds.map(() => '?').join(',')})`,
    bundleIds
  );
  const byBundle = new Map();
  for (const row of rows || []) {
    const bid = Number(row?.bundle_id || 0);
    if (!bid) continue;
    if (!byBundle.has(bid)) byBundle.set(bid, []);
    byBundle.get(bid).push({
      product_id: Number(row?.product_id || 0),
      quantity: Math.max(1, Number(row?.quantity || 1)),
    });
  }
  for (const bid of bundleIds) {
    const candidateSig = buildBundleSignature(byBundle.get(bid) || []);
    if (candidateSig && candidateSig === sig) return bid;
  }
  return null;
}

async function getLatestUserEmbedding(pool, userId) {
  const uid = Number(userId || 0);
  if (!uid) return null;
  try {
    const [rows] = await pool.query(
      `SELECT user_id, embedding, embedding_model, embedding_dimension, generated_at
       FROM user_embeddings
       WHERE user_id = ?
       LIMIT 1`,
      [uid]
    );
    return rows?.[0] || null;
  } catch {
    return null;
  }
}

async function getActiveModelMetadata(pool) {
  try {
    const [rows] = await pool.query(
      `SELECT id, model_key, model_version, framework, status, artifact_uri, activated_at
       FROM model_registry
       WHERE status = 'active'
       ORDER BY activated_at DESC, updated_at DESC
       LIMIT 1`
    );
    return rows?.[0] || null;
  } catch {
    return null;
  }
}

async function loadModelArtifact(activeModel) {
  const artifactPath = String(activeModel?.artifact_uri || '').trim();
  if (!artifactPath) return null;
  const key = `${activeModel.model_version}::${artifactPath}`;
  if (modelArtifactCache.has(key)) return modelArtifactCache.get(key);
  try {
    const raw = await fs.readFile(artifactPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.features) || !Array.isArray(parsed?.weights) || !parsed?.scaler) {
      return null;
    }
    modelArtifactCache.set(key, parsed);
    return parsed;
  } catch {
    return null;
  }
}

function buildActivitySignals(activityEvents = []) {
  const perProduct = new Map();
  const categoryCounts = new Map();
  let totalCategoryEvents = 0;
  let priceSum = 0;
  let priceCount = 0;
  for (const ev of activityEvents) {
    const pid = Number(ev?.product_id || 0);
    if (!pid) continue;
    const type = String(ev?.event_type || '').toLowerCase();
    if (!perProduct.has(pid)) {
      perProduct.set(pid, {
        view: 0, click: 0, cart: 0, purchase: 0, search: 0,
      });
    }
    const cur = perProduct.get(pid);
    if (type === 'view_product') cur.view += 1;
    else if (type === 'click_product') cur.click += 1;
    else if (type === 'add_to_cart') cur.cart += 1;
    else if (type === 'purchase') cur.purchase += 1;
    else if (type === 'search') cur.search += 1;
  }
  return { perProduct, categoryCounts, totalCategoryEvents, priceSum, priceCount };
}

function buildFeatureVectorForProduct(product, modelArtifact, context) {
  const featureKeys = modelArtifact.features || [];
  const scaler = modelArtifact.scaler || {};
  const pid = Number(product?.id || 0);
  const signals = context?.activitySignals?.perProduct?.get(pid) || { view: 0, click: 0, cart: 0, purchase: 0, search: 0 };
  const category = String(product?.category || '').toLowerCase();
  const categoryFreq = Number(context?.categoryFreq?.get(category) || 0);
  const totalCategoryFreq = Number(context?.totalCategoryFreq || 0);
  const categoryAffinity = totalCategoryFreq > 0 ? (categoryFreq / totalCategoryFreq) : 0;
  const price = Number(product?.price || 0);
  const avgPrice = Number(context?.avgPrice || 0);
  const priceAffinity = (avgPrice > 0 && price > 0) ? Math.max(0, Math.min(1, 1 - (Math.abs(price - avgPrice) / Math.max(avgPrice, 1)))) : 0;
  const lastEventAt = context?.lastEventAtByProduct?.get(pid) || null;
  const daysSinceLast = lastEventAt ? Math.max(0, Math.floor((Date.now() - Number(lastEventAt)) / 86400000)) : 30;
  const embeddingSimilarity = Number(product?.embedding_similarity || 0);

  const featureValues = {
    request_count: Number(context?.exposureCountByProduct?.get(pid) || 0),
    view_count: Number(signals.view || 0),
    click_count: Number(signals.click || 0),
    cart_count: Number(signals.cart || 0),
    search_count: Number(signals.search || 0),
    days_since_last_event: Number(daysSinceLast || 0),
    category_affinity: Number(categoryAffinity || 0),
    price_affinity: Number(priceAffinity || 0),
    popularity_score: Number(product?.popularity_score || 0),
    embedding_similarity: Number(embeddingSimilarity || 0),
    prior_ctr: 0,
    prior_cvr: 0,
  };

  const vec = [1.0];
  for (const key of featureKeys) {
    const rawVal = Number(featureValues[key] || 0);
    const st = scaler[key];
    if (!st || !Number.isFinite(Number(st?.p05)) || !Number.isFinite(Number(st?.p95)) || !Number.isFinite(Number(st?.span))) {
      vec.push(rawVal);
      continue;
    }
    const clipped = Math.min(Number(st.p95), Math.max(Number(st.p05), rawVal));
    const norm = (clipped - Number(st.p05)) / Math.max(1e-6, Number(st.span));
    vec.push(Number.isFinite(norm) ? norm : 0);
  }
  return vec;
}

function attachEmbeddingSimilarity(products, userEmbedding) {
  const userVec = parseEmbeddingVector(userEmbedding?.embedding || null);
  const userModel = String(userEmbedding?.embedding_model || '');
  const userDim = Number(userEmbedding?.embedding_dimension || 0);
  return products.map((product) => {
    const productVec = parseEmbeddingVector(product?.embedding || null);
    const productModel = String(product?.embedding_model || '');
    const productDim = Number(product?.embedding_dimension || 0);
    let embeddingSimilarity = 0;
    if (
      userVec && productVec &&
      userModel && productModel &&
      userModel === productModel &&
      userDim > 0 && userDim === productDim &&
      userVec.length === productVec.length
    ) {
      embeddingSimilarity = Number((((cosineSimilarity(userVec, productVec) + 1) / 2)).toFixed(4));
    }
    return { ...product, embedding_similarity: embeddingSimilarity };
  });
}

function applyModelInferenceToSuggestions(suggestions, modelArtifact, context, alpha = 0.7) {
  if (!Array.isArray(suggestions) || !suggestions.length || !modelArtifact) return { suggestions, scoredRows: [] };
  const scored = suggestions.map((item) => {
    const product = item?.product || {};
    const vec = buildFeatureVectorForProduct(product, modelArtifact, context);
    const raw = dot(modelArtifact.weights || [], vec);
    const modelScore = sigmoid(raw);
    const heuristicScore = Number(item?.realtime_score ?? item?.promotion_score ?? 0);
    const heuristicNorm = Math.max(0, Math.min(1, heuristicScore / 10));
    const blended = (alpha * modelScore) + ((1 - alpha) * heuristicNorm);
    return {
      ...item,
      model_score: Number(modelScore.toFixed(6)),
      blended_score: Number(blended.toFixed(6)),
      realtime_score: Number((blended * 10).toFixed(4)),
    };
  }).sort((a, b) => Number(b.realtime_score || 0) - Number(a.realtime_score || 0));

  const scoredRows = scored.map((row, idx) => ({
    product_id: Number(row?.product?.id || 0) || null,
    model_score: Number(row.model_score || 0),
    blended_score: Number(row.blended_score || 0),
    rank_position: idx + 1,
  })).filter((r) => r.product_id);

  return { suggestions: scored, scoredRows };
}

function rebuildBundleFromSuggestions(suggestions, budget) {
  const maxBudget = Number(budget || 0);
  const ranked = (Array.isArray(suggestions) ? suggestions : [])
    .map((entry) => {
      const product = entry?.product || {};
      const price = Number(product?.price || 0);
      const score = Number(entry?.realtime_score || 0);
      const stock = Number(product?.stock || 0);
      return { product, price, score, stock, ratio: price > 0 ? score / price : 0 };
    })
    .filter((x) => x.price > 0 && x.score > 0 && x.stock > 0)
    .sort((a, b) => b.ratio - a.ratio);

  const bundle = [];
  let total = 0;
  let totalScore = 0;
  for (const item of ranked) {
    if (total + item.price > maxBudget) continue;
    total += item.price;
    totalScore += item.score;
    bundle.push({
      id: item.product.id,
      name: item.product.name,
      price: item.price,
      category: item.product.category || null,
      image_path: item.product.image_path || null,
      stock: item.product.stock || 0,
      score: Number(item.score.toFixed(4)),
    });
  }
  return {
    budget: maxBudget,
    total_cost: Number(total.toFixed(2)),
    remaining_budget: Number((maxBudget - total).toFixed(2)),
    bundle,
    bundle_score: Number(totalScore.toFixed(4)),
    engine: 'bundle_optimization',
    strategy: 'greedy_ratio',
  };
}

async function safeWriteModelInferenceLogs(pool, payload) {
  const rows = Array.isArray(payload?.rows) ? payload.rows : [];
  if (!rows.length) return;
  try {
    for (const row of rows) {
      await pool.query(
        `INSERT INTO model_inference_logs
         (request_id, model_registry_id, model_version, route, strategy, user_id, product_id, score, rank_position, fallback_used, error_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          payload.request_id || null,
          payload.model_registry_id || null,
          payload.model_version || null,
          payload.route || null,
          payload.strategy || 'heuristic_v1',
          payload.user_id || null,
          row.product_id || null,
          row.blended_score ?? row.model_score ?? null,
          row.rank_position || null,
          payload.fallback_used ? 1 : 0,
          payload.error_type || null,
        ]
      );
    }
  } catch {
    // non-blocking analytics write
  }
}

function mapActivityToInteractionType(eventType) {
  const type = String(eventType || '').toLowerCase();
  if (type === 'view_product') return 'viewed';
  if (type === 'click_product') return 'clicked';
  if (type === 'add_to_cart') return 'carted';
  if (type === 'purchase') return 'purchased';
  if (type === 'search') return 'searched';
  return null;
}

function inferDeviceType(userAgent) {
  const ua = String(userAgent || '').toLowerCase();
  if (!ua) return 'desktop';
  if (ua.includes('ipad') || (ua.includes('android') && !ua.includes('mobile'))) return 'tablet';
  if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) return 'mobile';
  return 'desktop';
}

async function safeWriteRecommendationLog(pool, payload) {
  try {
    const [result] = await pool.query(
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
    return Number(result?.insertId || 0) || null;
  } catch {
    // non-blocking analytics write
    return null;
  }
}

function buildExposureRowsFromPipeline(responsePayload, strategy, experimentVariant = null) {
  const realtime = Array.isArray(responsePayload?.realtime_recommendation?.suggestions)
    ? responsePayload.realtime_recommendation.suggestions
    : [];
  return realtime
    .slice(0, 20)
    .map((item, idx) => ({
      product_id: Number(item?.product?.id || 0) || null,
      rank_position: idx + 1,
      score: Number(item?.realtime_score ?? item?.promotion_score ?? 0),
      source: 'ai_reranking',
      strategy,
      metadata: {
        engine: 'realtime_recommendation',
        experiment_variant: experimentVariant,
      },
    }))
    .filter((row) => Number(row.product_id || 0) > 0);
}

function buildExposureRowsFromRecommendation(recommendation, strategy, experimentVariant = null) {
  const bundle = Array.isArray(recommendation?.bundle) ? recommendation.bundle : [];
  return bundle
    .slice(0, 20)
    .map((item, idx) => ({
      product_id: Number(item?.id || 0) || null,
      rank_position: idx + 1,
      score: Number(item?.score ?? 0),
      source: 'bundle_engine',
      strategy,
      metadata: {
        engine: 'bundle_optimization',
        experiment_variant: experimentVariant,
      },
    }))
    .filter((row) => Number(row.product_id || 0) > 0);
}

async function safeWriteRecommendationExposures(pool, payload) {
  const rows = Array.isArray(payload?.rows) ? payload.rows : [];
  if (!rows.length) return;

  try {
    for (const row of rows) {
      await pool.query(
        `INSERT INTO recommendation_exposures
         (request_id, recommendation_log_id, clerk_user_id, user_id, session_id, product_id, rank_position, source, strategy, score, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          payload.request_id,
          payload.recommendation_log_id || null,
          payload.clerk_user_id || null,
          payload.user_id || null,
          payload.session_id || null,
          row.product_id,
          Number(row.rank_position || 0),
          row.source || 'ai_reranking',
          row.strategy || payload.strategy || 'heuristic_v1',
          Number.isFinite(Number(row.score)) ? Number(row.score) : null,
          JSON.stringify(row.metadata || {}),
        ]
      );
    }
  } catch {
    // non-blocking analytics write
  }
}

function mapInteractionToOutcomeType(interactionType) {
  if (interactionType === 'viewed') return 'viewed';
  if (interactionType === 'clicked') return 'clicked';
  if (interactionType === 'carted') return 'carted';
  if (interactionType === 'purchased') return 'purchased';
  return null;
}

async function safeWriteRecommendationOutcome(pool, payload) {
  const outcomeType = mapInteractionToOutcomeType(payload?.interaction_type);
  const productId = Number(payload?.product_id || 0);
  if (!outcomeType || !productId || !payload?.user_id) return;

  try {
    let rows;
    if (payload?.recommendation_request_id) {
      [rows] = await pool.query(
        `SELECT id, request_id
         FROM recommendation_exposures
         WHERE request_id = ?
           AND user_id = ?
           AND product_id = ?
         ORDER BY created_at DESC
         LIMIT 1`,
        [String(payload.recommendation_request_id), payload.user_id, productId]
      );
    } else {
      [rows] = await pool.query(
        `SELECT id, request_id
         FROM recommendation_exposures
         WHERE user_id = ?
           AND product_id = ?
           AND created_at >= NOW() - INTERVAL 7 DAY
         ORDER BY created_at DESC
         LIMIT 1`,
        [payload.user_id, productId]
      );
    }

    const exposure = rows?.[0];
    if (!exposure?.id) return;

    await pool.query(
      `INSERT INTO recommendation_outcomes
       (exposure_id, request_id, user_id, product_id, outcome_type, outcome_value, latency_ms)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(exposure.id),
        String(exposure.request_id || payload.recommendation_request_id || ''),
        payload.user_id,
        productId,
        outcomeType,
        1.0,
        payload.latency_ms == null ? null : Number(payload.latency_ms),
      ]
    );
  } catch {
    // non-blocking analytics write
  }
}

async function diagnoseRecommendationOutcomeLink(pool, payload) {
  const outcomeType = mapInteractionToOutcomeType(payload?.interaction_type);
  const productId = Number(payload?.product_id || 0);
  const userId = Number(payload?.user_id || 0);
  if (!outcomeType) {
    return { linked: false, reason: 'unsupported_interaction_type', outcome_type: null };
  }
  if (!userId) {
    return { linked: false, reason: 'missing_user_id', outcome_type: outcomeType };
  }
  if (!productId) {
    return { linked: false, reason: 'missing_product_id', outcome_type: outcomeType };
  }

  if (payload?.recommendation_request_id) {
    const [rows] = await pool.query(
      `SELECT id, request_id, created_at
       FROM recommendation_exposures
       WHERE request_id = ?
         AND user_id = ?
         AND product_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [String(payload.recommendation_request_id), userId, productId]
    );
    if (!rows?.[0]?.id) {
      return {
        linked: false,
        reason: 'no_matching_exposure_for_request',
        outcome_type: outcomeType,
        recommendation_request_id: String(payload.recommendation_request_id),
      };
    }
    return {
      linked: true,
      reason: 'matched_by_request_id',
      outcome_type: outcomeType,
      exposure: rows[0],
    };
  }

  const [fallbackRows] = await pool.query(
    `SELECT id, request_id, created_at
     FROM recommendation_exposures
     WHERE user_id = ?
       AND product_id = ?
       AND created_at >= NOW() - INTERVAL 7 DAY
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId, productId]
  );
  if (!fallbackRows?.[0]?.id) {
    return {
      linked: false,
      reason: 'no_recent_exposure_for_user_product',
      outcome_type: outcomeType,
    };
  }
  return {
    linked: true,
    reason: 'matched_by_recent_user_product',
    outcome_type: outcomeType,
    exposure: fallbackRows[0],
  };
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
     FROM user_activity ua
     JOIN users u ON u.id = ua.user_id
     WHERE ua.product_id = ?
       AND ua.user_id IS NOT NULL
       AND COALESCE(u.is_flagged, 0) = 0`,
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
    s.name AS seller_name,
    s.location AS seller_location,
    s.rating AS seller_rating,
    COALESCE(pm.popularity_score, 0) AS popularity_score,
    pm.tag_vector,
    pm.extra,
    pe.embedding,
    pe.embedding_model,
    pe.embedding_dimension
  FROM products p
  LEFT JOIN sellers s ON s.id = p.seller_id
  LEFT JOIN product_metadata pm ON pm.product_id = p.id
  LEFT JOIN product_embeddings pe ON pe.product_id = p.id
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

    const [[activeUsers]] = await pool.query(
      `SELECT COUNT(DISTINCT user_id) AS total_active_users
       FROM user_activity
       WHERE user_id IS NOT NULL`
    );

    let embeddedUsers = 0;
    let userEmbeddingsTablePresent = false;
    try {
      const [tableRows] = await pool.query(
        `SELECT COUNT(*) AS total
         FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'user_embeddings'`
      );
      userEmbeddingsTablePresent = Number(tableRows?.[0]?.total || 0) > 0;
      if (userEmbeddingsTablePresent) {
        const [[userEmbeddings]] = await pool.query('SELECT COUNT(*) AS embedded_users FROM user_embeddings');
        embeddedUsers = Number(userEmbeddings?.embedded_users || 0);
      }
    } catch {
      userEmbeddingsTablePresent = false;
      embeddedUsers = 0;
    }

    const totalActiveUsers = Number(activeUsers?.total_active_users || 0);
    const userCoverage = totalActiveUsers
      ? Number(((embeddedUsers / totalActiveUsers) * 100).toFixed(2))
      : 0;

    return res.status(200).json({
      total_products: totalProducts,
      embedded_products: embeddedProducts,
      pending_products: Math.max(0, totalProducts - embeddedProducts),
      coverage_percent: coverage,
      total_active_users: totalActiveUsers,
      embedded_users: embeddedUsers,
      pending_users: Math.max(0, totalActiveUsers - embeddedUsers),
      user_coverage_percent: userCoverage,
      user_embeddings_table_present: userEmbeddingsTablePresent,
    });
  } catch (error) {
    logRouteError('/api/embeddings/status', req, error);
    return sendInternalError(res, req, 'Failed to fetch embeddings status');
  }
});

app.get('/api/experiments/status', async (req, res) => {
  try {
    const pool = getPool();
    const windowDays = Math.max(1, Math.min(365, Number(req.query?.window_days || 14)));
    const [split] = await pool.query(
      `SELECT strategy AS variant, COUNT(*) AS exposures
       FROM recommendation_exposures
       WHERE created_at >= NOW() - INTERVAL ? DAY
       GROUP BY strategy
       ORDER BY exposures DESC`,
      [windowDays]
    );
    const [metrics] = await pool.query(
      `SELECT
        e.strategy AS variant,
        COUNT(*) AS exposures,
        SUM(CASE WHEN o.outcome_type = 'clicked' THEN 1 ELSE 0 END) AS clicks,
        SUM(CASE WHEN o.outcome_type = 'carted' THEN 1 ELSE 0 END) AS carts,
        SUM(CASE WHEN o.outcome_type = 'purchased' THEN 1 ELSE 0 END) AS purchases
      FROM recommendation_exposures e
      LEFT JOIN recommendation_outcomes o ON o.exposure_id = e.id
      WHERE e.created_at >= NOW() - INTERVAL ? DAY
      GROUP BY e.strategy
      ORDER BY exposures DESC`,
      [windowDays]
    );

    const formatted = metrics.map((row) => {
      const exposures = Number(row.exposures || 0);
      const clicks = Number(row.clicks || 0);
      const carts = Number(row.carts || 0);
      const purchases = Number(row.purchases || 0);
      return {
        variant: row.variant,
        exposures,
        clicks,
        carts,
        purchases,
        ctr: exposures ? Number((clicks / exposures).toFixed(4)) : 0,
        cart_rate: exposures ? Number((carts / exposures).toFixed(4)) : 0,
        purchase_rate: exposures ? Number((purchases / exposures).toFixed(4)) : 0,
      };
    });

    return res.status(200).json({
      rollout_percent_hybrid: EXPERIMENT_HYBRID_PERCENT,
      window_days: windowDays,
      traffic_split: split,
      metrics: formatted,
    });
  } catch (error) {
    logRouteError('/api/experiments/status', req, error);
    return sendInternalError(res, req, 'Failed to fetch experiments status');
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
      session_id = null,
      duration_seconds = 0,
      device_type = null,
      recommendation_request_id = null,
      latency_ms = null,
      results_count = 0,
      clicked_product_id = null,
      search_duration_ms = 0,
    } = req.body || {};

    if (!event_type) {
      return res.status(400).json({ error: 'event_type is required' });
    }
    const normalizedEventType = String(event_type || '').toLowerCase();
    const safeProductId = product_id == null ? null : Number(product_id);
    const requiresProductId = new Set(['view_product', 'click_product', 'add_to_cart', 'purchase']);
    if (requiresProductId.has(normalizedEventType) && (!Number.isFinite(safeProductId) || safeProductId <= 0)) {
      return res.status(400).json({ error: `product_id is required for event_type=${normalizedEventType}` });
    }

    const pool = getPool();
    if (normalizedEventType === 'add_to_cart' || normalizedEventType === 'purchase') {
      const snapshot = await getUserAbuseSnapshot(pool, req.auth.dbUserId);
      const decision = detectAbuseBlock(snapshot, {
        kind: normalizedEventType === 'add_to_cart' ? 'activity_add_to_cart' : 'activity_purchase',
      });
      if (decision.blocked) {
        await flagUserAsSuspicious(pool, req.auth.dbUserId, decision.reason);
        return res.status(429).json({
          error: 'Suspicious behavior detected. Activity temporarily restricted.',
          error_type: 'SUSPICIOUS_ACTIVITY_BLOCKED',
          reason: decision.reason,
          retry_after_seconds: decision.retry_after_seconds,
          snapshot,
          request_id: req.requestId,
        });
      }
    }

    await pool.query(
      `INSERT INTO user_activity (user_id, clerk_user_id, event_type, product_id, category_id, search_query, weight_score)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.auth.dbUserId, req.auth.userId, normalizedEventType, safeProductId, category_id, search_query, weight_score]
    );

    const interactionType = mapActivityToInteractionType(normalizedEventType);
    if (interactionType) {
      const safeDuration = Math.max(0, Number(duration_seconds) || 0);
      const resolvedDeviceType = ['mobile', 'desktop', 'tablet'].includes(String(device_type || '').toLowerCase())
        ? String(device_type).toLowerCase()
        : inferDeviceType(req.headers['user-agent']);
      const safeSessionId = session_id ? String(session_id).slice(0, 100) : null;

      await pool.query(
        `INSERT INTO user_interactions (user_id, product_id, interaction_type, duration_seconds, session_id, device_type)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [req.auth.dbUserId, safeProductId, interactionType, safeDuration, safeSessionId, resolvedDeviceType]
      );

      await safeWriteRecommendationOutcome(pool, {
        recommendation_request_id,
        user_id: req.auth.dbUserId,
        product_id: safeProductId,
        interaction_type: interactionType,
        latency_ms,
      });
    }

    if (normalizedEventType === 'search' && search_query) {
      const safeResultsCount = Math.max(0, Number(results_count) || 0);
      const safeClickedProductId = clicked_product_id == null ? null : Number(clicked_product_id);
      const safeSearchDurationMs = Math.max(0, Number(search_duration_ms || latency_ms || 0) || 0);
      await pool.query(
        `INSERT INTO search_logs
         (user_id, query_text, results_count, clicked_product_id, search_duration_ms)
         VALUES (?, ?, ?, ?, ?)`,
        [req.auth.dbUserId, String(search_query).slice(0, 255), safeResultsCount, safeClickedProductId, safeSearchDurationMs]
      );
    }

    if (safeProductId) {
      await refreshProductPopularityScore(pool, safeProductId);
    }

    return res.status(201).json({ message: 'Activity logged' });
  } catch (error) {
    logRouteError('/api/activity', req, error);
    return sendInternalError(res, req, 'Failed to log activity');
  }
});

app.get('/api/recommendation-outcomes/debug', requireClerkAuth, ensureUserRecord, async (req, res) => {
  try {
    const interactionType = String(req.query.interaction_type || '').trim();
    const productId = Number(req.query.product_id || 0);
    const recommendationRequestId = req.query.recommendation_request_id
      ? String(req.query.recommendation_request_id)
      : null;

    const pool = getPool();
    const diagnosis = await diagnoseRecommendationOutcomeLink(pool, {
      interaction_type: interactionType,
      user_id: req.auth.dbUserId,
      product_id: productId,
      recommendation_request_id: recommendationRequestId,
    });

    const [recentExposures] = await pool.query(
      `SELECT id, request_id, product_id, strategy, source, created_at
       FROM recommendation_exposures
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [req.auth.dbUserId]
    );

    return res.status(200).json({
      diagnosis,
      input: {
        interaction_type: interactionType,
        product_id: productId || null,
        recommendation_request_id: recommendationRequestId,
      },
      recent_exposures: recentExposures,
    });
  } catch (error) {
    logRouteError('/api/recommendation-outcomes/debug', req, error);
    return sendInternalError(res, req, 'Failed to debug recommendation outcome linkage');
  }
});

app.post('/api/recommendations', requireClerkAuth, ensureUserRecord, async (req, res) => {
  try {
    const { budget, preferences = [] } = req.body || {};

    if (!budget || Number(budget) <= 0) {
      return res.status(400).json({ error: 'budget must be a positive number' });
    }

    const pool = getPool();
    const activeModel = await getActiveModelMetadata(pool);
    const [products] = await pool.query(`${PRODUCT_WITH_METADATA_SQL} WHERE p.stock > 0`);
    const { activityEvents, latestEvent } = await getRecentUserActivity(pool, req.auth.dbUserId);
    const userEmbedding = await getLatestUserEmbedding(pool, req.auth.dbUserId);
    const boostedProducts = applyOutcomeBoost(attachEmbeddingSimilarity(products, userEmbedding), activityEvents, userEmbedding);
    let recommendation;
    let strategy = experiment.variant;
    try {
      recommendation = await getRecommendations({
        budget: Number(budget),
        preferences,
        user_id: req.auth.dbUserId,
        products: boostedProducts,
        activity_events: activityEvents,
        latest_event: latestEvent,
      }, { requestId: req.requestId });
      recordFallbackTelemetry('/api/recommendations', false);
    } catch (error) {
      const shouldFallback = String(error?.type || '').startsWith('UPSTREAM_');
      if (!shouldFallback) throw error;
      const local = runLocalHeuristicPipeline({
        budget: Number(budget),
        preferences,
        products: boostedProducts,
        activity_events: activityEvents,
        latest_event: latestEvent,
      });
      recommendation = {
        budget: local.bundle_optimization.budget,
        total_cost: local.bundle_optimization.total_cost,
        remaining_budget: local.bundle_optimization.remaining_budget,
        bundle: local.bundle_optimization.bundle,
        explanation: 'Local heuristic fallback used while Python engine is unavailable.',
      };
      strategy = experiment.variant === 'hybrid_v1' ? 'hybrid_v1_fallback_local' : 'heuristic_v1_fallback_local';
      recordFallbackTelemetry('/api/recommendations', true);
    }

    let modelApplied = false;
    let inferenceRows = [];
    if (experiment.variant === 'hybrid_v1' && activeModel?.framework === 'custom-logistic') {
      const artifact = await loadModelArtifact(activeModel);
      if (artifact) {
        const byProduct = new Map(boostedProducts.map((p) => [Number(p.id), p]));
        const categoryFreq = new Map();
        const exposureCountByProduct = new Map();
        const lastEventAtByProduct = new Map();
        let avgPrice = 0;
        let priceCount = 0;
        let totalCategoryFreq = 0;
        for (const ev of activityEvents) {
          const pid = Number(ev?.product_id || 0);
          if (!pid) continue;
          exposureCountByProduct.set(pid, (exposureCountByProduct.get(pid) || 0) + 1);
          const product = byProduct.get(pid);
          if (!product) continue;
          const cat = String(product?.category || '').toLowerCase();
          categoryFreq.set(cat, (categoryFreq.get(cat) || 0) + 1);
          totalCategoryFreq += 1;
          const price = Number(product?.price || 0);
          if (price > 0) {
            avgPrice += price;
            priceCount += 1;
          }
          const ts = ev?.created_at ? new Date(ev.created_at).getTime() : NaN;
          if (Number.isFinite(ts) && ts > 0) {
            const prev = Number(lastEventAtByProduct.get(pid) || 0);
            if (ts > prev) lastEventAtByProduct.set(pid, ts);
          }
        }
        const baseSuggestions = boostedProducts.map((product) => ({
          product,
          realtime_score: Number((scoreProductBase(product, normalizePrefs(preferences)) + (Number(product.outcome_boost || 0) * 2)).toFixed(4)),
        }));
        const context = {
          activitySignals: buildActivitySignals(activityEvents),
          categoryFreq,
          totalCategoryFreq,
          avgPrice: priceCount > 0 ? (avgPrice / priceCount) : 0,
          exposureCountByProduct,
          lastEventAtByProduct,
        };
        const inferred = applyModelInferenceToSuggestions(baseSuggestions, artifact, context, Number(process.env.MODEL_BLEND_ALPHA || 0.7));
        const rebuilt = rebuildBundleFromSuggestions(inferred.suggestions, Number(budget));
        recommendation = {
          budget: rebuilt.budget,
          total_cost: rebuilt.total_cost,
          remaining_budget: rebuilt.remaining_budget,
          bundle: rebuilt.bundle,
          explanation: 'Bundle selected via active model + heuristic blend under budget constraint.',
        };
        inferenceRows = inferred.scoredRows;
        modelApplied = true;
      }
    }

    recommendation = {
      ...recommendation,
      meta: {
        ...(recommendation?.meta || {}),
        strategy,
        model_applied: modelApplied,
        experiment: {
          variant: experiment.variant,
          bucket: experiment.bucket,
          hybrid_rollout_percent: EXPERIMENT_HYBRID_PERCENT,
        },
        active_model: activeModel
          ? {
            model_key: activeModel.model_key,
            model_version: activeModel.model_version,
            framework: activeModel.framework,
            activated_at: activeModel.activated_at,
          }
          : null,
      },
    };

    const recommendationLogId = await safeWriteRecommendationLog(pool, {
      clerk_user_id: req.auth.userId,
      user_id: req.auth.dbUserId,
      source_event_type: latestEvent?.event_type || null,
      source_product_id: latestEvent?.product_id || null,
      recommendation_payload: recommendation,
      model_name: strategy,
      latency_ms: null,
    });
    await safeWriteRecommendationExposures(pool, {
      request_id: req.requestId,
      recommendation_log_id: recommendationLogId,
      clerk_user_id: req.auth.userId,
      user_id: req.auth.dbUserId,
      session_id: null,
      strategy,
      rows: buildExposureRowsFromRecommendation(recommendation, strategy, experiment.variant),
    });
    if (modelApplied && activeModel && inferenceRows.length) {
      await safeWriteModelInferenceLogs(pool, {
        request_id: req.requestId,
        model_registry_id: activeModel.id || null,
        model_version: activeModel.model_version,
        route: '/api/recommendations',
        strategy,
        user_id: req.auth.dbUserId,
        rows: inferenceRows,
      });
    }
    recommendation.meta = {
      ...(recommendation?.meta || {}),
      request_id: req.requestId,
    };
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
    const experiment = resolveExperimentVariant(req.auth?.userId || req.auth?.dbUserId || req.requestId);
    const activeModel = await getActiveModelMetadata(pool);

    if (!normalizedPayload.products.length) {
      const [products] = await pool.query(`${PRODUCT_WITH_METADATA_SQL} WHERE p.stock > 0`);
      normalizedPayload.products = products;
    }

    if (!normalizedPayload.activity_events?.length) {
      const { activityEvents, latestEvent } = await getRecentUserActivity(pool, req.auth.dbUserId);
      normalizedPayload.activity_events = activityEvents;
      normalizedPayload.latest_event = normalizedPayload.latest_event || latestEvent;
    }
    const userEmbedding = await getLatestUserEmbedding(pool, req.auth.dbUserId);
    const hasActivityContext = Array.isArray(normalizedPayload.activity_events) && normalizedPayload.activity_events.length > 0;
    normalizedPayload.products = applyOutcomeBoost(attachEmbeddingSimilarity(normalizedPayload.products, userEmbedding), normalizedPayload.activity_events, userEmbedding);

    let result;
    let strategy = experiment.variant;
    try {
      result = await getIntelligencePipeline(normalizedPayload, { requestId: req.requestId });
      recordFallbackTelemetry('/api/intelligence/pipeline', false);
    } catch (error) {
      const shouldFallback = String(error?.type || '').startsWith('UPSTREAM_');
      if (!shouldFallback) throw error;
      result = runLocalHeuristicPipeline(normalizedPayload);
      strategy = experiment.variant === 'hybrid_v1' ? 'hybrid_v1_fallback_local' : 'heuristic_v1_fallback_local';
      recordFallbackTelemetry('/api/intelligence/pipeline', true);
    }

    let modelApplied = false;
    let inferenceRows = [];
    if (experiment.variant === 'hybrid_v1' && activeModel?.framework === 'custom-logistic' && result?.realtime_recommendation?.suggestions?.length) {
      const artifact = await loadModelArtifact(activeModel);
      if (artifact) {
        const byProduct = new Map((normalizedPayload.products || []).map((p) => [Number(p.id), p]));
        const categoryFreq = new Map();
        const exposureCountByProduct = new Map();
        const lastEventAtByProduct = new Map();
        let avgPrice = 0;
        let priceCount = 0;
        let totalCategoryFreq = 0;
        for (const ev of (normalizedPayload.activity_events || [])) {
          const pid = Number(ev?.product_id || 0);
          if (!pid) continue;
          exposureCountByProduct.set(pid, (exposureCountByProduct.get(pid) || 0) + 1);
          const product = byProduct.get(pid);
          if (!product) continue;
          const cat = String(product?.category || '').toLowerCase();
          categoryFreq.set(cat, (categoryFreq.get(cat) || 0) + 1);
          totalCategoryFreq += 1;
          const price = Number(product?.price || 0);
          if (price > 0) {
            avgPrice += price;
            priceCount += 1;
          }
          const ts = ev?.created_at ? new Date(ev.created_at).getTime() : NaN;
          if (Number.isFinite(ts) && ts > 0) {
            const prev = Number(lastEventAtByProduct.get(pid) || 0);
            if (ts > prev) lastEventAtByProduct.set(pid, ts);
          }
        }
        const context = {
          activitySignals: buildActivitySignals(normalizedPayload.activity_events || []),
          categoryFreq,
          totalCategoryFreq,
          avgPrice: priceCount > 0 ? (avgPrice / priceCount) : 0,
          exposureCountByProduct,
          lastEventAtByProduct,
        };
        const inferred = applyModelInferenceToSuggestions(result.realtime_recommendation.suggestions, artifact, context, Number(process.env.MODEL_BLEND_ALPHA || 0.7));
        result.realtime_recommendation.suggestions = inferred.suggestions;
        if (result?.bundle_optimization?.budget) {
          const rebuilt = rebuildBundleFromSuggestions(inferred.suggestions, Number(result.bundle_optimization.budget));
          result.bundle_optimization = {
            ...result.bundle_optimization,
            ...rebuilt,
          };
        }
        inferenceRows = inferred.scoredRows;
        modelApplied = true;
      }
    }

    const responsePayload = {
      ...result,
      meta: {
        ...(result?.meta || {}),
        has_activity_context: hasActivityContext,
        strategy,
        model_applied: modelApplied,
        experiment: {
          variant: experiment.variant,
          bucket: experiment.bucket,
          hybrid_rollout_percent: EXPERIMENT_HYBRID_PERCENT,
        },
        active_model: activeModel
          ? {
            model_key: activeModel.model_key,
            model_version: activeModel.model_version,
            framework: activeModel.framework,
            activated_at: activeModel.activated_at,
          }
          : null,
      },
    };

    const recommendationLogId = await safeWriteRecommendationLog(pool, {
      clerk_user_id: req.auth.userId,
      user_id: req.auth.dbUserId,
      source_event_type: normalizedPayload?.latest_event?.event_type || null,
      source_product_id: normalizedPayload?.latest_event?.product_id || null,
      recommendation_payload: responsePayload,
      model_name: strategy,
      latency_ms: null,
    });
    await safeWriteRecommendationExposures(pool, {
      request_id: req.requestId,
      recommendation_log_id: recommendationLogId,
      clerk_user_id: req.auth.userId,
      user_id: req.auth.dbUserId,
      session_id: null,
      strategy,
      rows: buildExposureRowsFromPipeline(responsePayload, strategy, experiment.variant),
    });
    if (modelApplied && activeModel && inferenceRows.length) {
      await safeWriteModelInferenceLogs(pool, {
        request_id: req.requestId,
        model_registry_id: activeModel.id || null,
        model_version: activeModel.model_version,
        route: '/api/intelligence/pipeline',
        strategy,
        user_id: req.auth.dbUserId,
        rows: inferenceRows,
      });
    }
    responsePayload.meta = {
      ...(responsePayload?.meta || {}),
      request_id: req.requestId,
    };

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

    const incomingSignature = buildBundleSignature(normalizedItems);
    if (!incomingSignature) {
      return res.status(400).json({ error: 'Unable to derive bundle signature' });
    }

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [existingBundles] = await conn.query(
        `SELECT id
         FROM bundles
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 400`,
        [req.auth.dbUserId || null]
      );
      let existingBundleId = null;
      if (Array.isArray(existingBundles) && existingBundles.length) {
        const bundleIds = existingBundles
          .map((row) => Number(row?.id || 0))
          .filter((id) => id > 0);
        if (bundleIds.length) {
          const [rows] = await conn.query(
            `SELECT bundle_id, product_id, quantity
             FROM bundle_items
             WHERE bundle_id IN (${bundleIds.map(() => '?').join(',')})`,
            bundleIds
          );
          const byBundle = new Map();
          for (const row of rows || []) {
            const bid = Number(row?.bundle_id || 0);
            if (!bid) continue;
            if (!byBundle.has(bid)) byBundle.set(bid, []);
            byBundle.get(bid).push({
              product_id: Number(row?.product_id || 0),
              quantity: Math.max(1, Number(row?.quantity || 1)),
            });
          }
          for (const bid of bundleIds) {
            const sig = buildBundleSignature(byBundle.get(bid) || []);
            if (sig && sig === incomingSignature) {
              existingBundleId = bid;
              break;
            }
          }
        }
      }

      if (existingBundleId) {
        await conn.query(
          `UPDATE bundles
           SET name = ?,
               description = ?,
               bundle_type = ?,
               estimated_total_price = ?
           WHERE id = ?`,
          [safeName, safeDesc, safeType, safeTotal, existingBundleId]
        );
        await conn.commit();
        return res.status(200).json({ id: existingBundleId, items_saved: normalizedItems.length, deduped: true });
      }

      const [insertBundle] = await conn.query(
        `INSERT INTO bundles (user_id, name, description, bundle_type, estimated_total_price)
         VALUES (?, ?, ?, ?, ?)`,
        [req.auth.dbUserId || null, safeName, safeDesc, safeType, safeTotal]
      );
      const bundleId = Number(insertBundle?.insertId || 0);
      for (const item of normalizedItems) {
        await conn.query(
          `INSERT INTO bundle_items (bundle_id, product_id, quantity) VALUES (?, ?, ?)`,
          [bundleId, item.product_id, item.quantity]
        );
      }
      await conn.commit();
      return res.status(201).json({ id: bundleId, items_saved: normalizedItems.length, deduped: false });
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

app.post('/api/bundles/rate', requireClerkAuth, ensureUserRecord, async (req, res) => {
  try {
    const {
      bundle_id = null,
      scenario_key = null,
      goal = null,
      rating_score,
      post_purchase_rating = null,
      reason_tags = [],
      generation_context = null,
      rating_stage = 'generated',
      items = [],
      source = 'smart_mode',
    } = req.body || {};

    const rating = Number(rating_score);
    if (!Number.isInteger(rating) || rating < 1 || rating > 4) {
      return res.status(400).json({ error: 'rating_score must be an integer from 1 to 4', request_id: req.requestId });
    }
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: 'items must be a non-empty array', request_id: req.requestId });
    }
    const safeStage = new Set(['generated', 'post_purchase']).has(String(rating_stage))
      ? String(rating_stage)
      : 'generated';
    const postPurchase = post_purchase_rating == null ? null : Number(post_purchase_rating);
    if (postPurchase != null && (!Number.isInteger(postPurchase) || postPurchase < 1 || postPurchase > 4)) {
      return res.status(400).json({ error: 'post_purchase_rating must be an integer from 1 to 4', request_id: req.requestId });
    }
    const safeReasonTags = Array.isArray(reason_tags)
      ? reason_tags.map((tag) => String(tag || '').trim().toLowerCase()).filter(Boolean).slice(0, 8)
      : [];

    const normalizedItems = items
      .map((item) => ({
        product_id: Number(item?.product_id || item?.id || 0),
        quantity: Math.max(1, Number(item?.quantity || item?.qty || 1)),
      }))
      .filter((item) => item.product_id > 0);
    if (!normalizedItems.length) {
      return res.status(400).json({ error: 'No valid bundle items', request_id: req.requestId });
    }

    const signature = buildBundleSignature(normalizedItems);
    if (!signature) {
      return res.status(400).json({ error: 'Unable to derive bundle signature', request_id: req.requestId });
    }

    const safeSource = new Set(['smart_mode', 'product_page', 'manual']).has(String(source))
      ? String(source)
      : 'smart_mode';
    let safeBundleId = bundle_id == null ? null : Number(bundle_id);
    const safeScenario = scenario_key == null ? null : String(scenario_key).slice(0, 64);
    const safeGoal = goal == null ? null : String(goal).slice(0, 255);

    const pool = getPool();
    if (!(Number.isFinite(safeBundleId) && safeBundleId > 0)) {
      safeBundleId = await resolveBundleIdBySignature(pool, req.auth.dbUserId, signature);
    }

    await pool.query(
      `INSERT INTO bundle_ratings
       (user_id, bundle_id, scenario_key, goal_text, rating_score, post_purchase_rating, reason_tags_json, bundle_signature, bundle_payload, generation_context_json, source, rating_stage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         bundle_id = COALESCE(VALUES(bundle_id), bundle_id),
         scenario_key = VALUES(scenario_key),
         goal_text = VALUES(goal_text),
         rating_score = VALUES(rating_score),
         post_purchase_rating = VALUES(post_purchase_rating),
         reason_tags_json = VALUES(reason_tags_json),
         bundle_payload = VALUES(bundle_payload),
         generation_context_json = VALUES(generation_context_json),
         source = VALUES(source),
         rating_stage = VALUES(rating_stage),
         updated_at = CURRENT_TIMESTAMP`,
      [
        req.auth.dbUserId,
        Number.isFinite(safeBundleId) && safeBundleId > 0 ? safeBundleId : null,
        safeScenario,
        safeGoal,
        rating,
        postPurchase,
        JSON.stringify(safeReasonTags),
        signature,
        JSON.stringify(normalizedItems),
        generation_context == null ? null : JSON.stringify(generation_context),
        safeSource,
        safeStage,
      ]
    );

    return res.status(201).json({
      ok: true,
      rating_score: rating,
      bundle_signature: signature,
      request_id: req.requestId,
    });
  } catch (error) {
    logRouteError('/api/bundles/rate', req, error);
    return sendInternalError(res, req, 'Failed to save bundle rating');
  }
});

app.post('/api/orders/checkout', requireClerkAuth, ensureUserRecord, async (req, res) => {
  try {
    const { items = [], status = 'paid' } = req.body || {};
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: 'items must be a non-empty array' });
    }

    const normalizedItems = items
      .map((item) => ({
        product_id: Number(item?.product_id || item?.id || 0),
        quantity: Math.max(1, Number(item?.quantity || item?.qty || 1)),
        unit_price: Number(item?.unit_price ?? item?.price ?? 0),
      }))
      .filter((item) => item.product_id > 0 && Number.isFinite(item.unit_price) && item.unit_price >= 0);

    if (!normalizedItems.length) {
      return res.status(400).json({ error: 'No valid checkout items' });
    }

    const safeStatus = String(status || 'paid').slice(0, 32) || 'paid';
    const totalAmount = Number(
      normalizedItems.reduce((sum, item) => sum + (Number(item.unit_price || 0) * Number(item.quantity || 1)), 0).toFixed(2)
    );

    const pool = getPool();
    const snapshot = await getUserAbuseSnapshot(pool, req.auth.dbUserId);
    const decision = detectAbuseBlock(snapshot, {
      kind: 'checkout',
      checkout_items: normalizedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      checkout_total: totalAmount,
    });
    if (decision.blocked) {
      await flagUserAsSuspicious(pool, req.auth.dbUserId, decision.reason);
      return res.status(429).json({
        error: 'Checkout blocked due to suspicious behavior. Please try again later.',
        error_type: 'SUSPICIOUS_CHECKOUT_BLOCKED',
        reason: decision.reason,
        retry_after_seconds: decision.retry_after_seconds,
        snapshot,
        request_id: req.requestId,
      });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [orderInsert] = await conn.query(
        `INSERT INTO orders (user_id, clerk_user_id, total_amount, status)
         VALUES (?, ?, ?, ?)`,
        [req.auth.dbUserId, req.auth.userId, totalAmount, safeStatus]
      );
      const orderId = Number(orderInsert?.insertId || 0);
      for (const item of normalizedItems) {
        await conn.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
           VALUES (?, ?, ?, ?)`,
          [orderId, item.product_id, item.quantity, item.unit_price]
        );
        await conn.query(
          `INSERT INTO user_activity (user_id, clerk_user_id, event_type, product_id, category_id, search_query, weight_score)
           VALUES (?, ?, 'purchase', ?, NULL, NULL, ?)`,
          [req.auth.dbUserId, req.auth.userId, item.product_id, Math.max(1, Number(item.quantity || 1))]
        );
        await conn.query(
          `INSERT INTO user_interactions (user_id, product_id, interaction_type, duration_seconds, session_id, device_type)
           VALUES (?, ?, 'purchased', 0, NULL, ?)`,
          [req.auth.dbUserId, item.product_id, inferDeviceType(req.headers['user-agent'])]
        );
      }
      await conn.commit();
      return res.status(201).json({
        order_id: orderId,
        total_amount: totalAmount,
        items_count: normalizedItems.length,
      });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    logRouteError('/api/orders/checkout', req, error);
    return sendInternalError(res, req, 'Failed to persist checkout order');
  }
});

app.get('/api/auth/access', requireClerkAuth, ensureUserRecord, async (req, res) => {
  return res.status(200).json({
    allowed: true,
    user_id: req.auth.dbUserId || null,
    role: req.auth.role || 'customer',
    is_admin: String(req.auth.role || '').toLowerCase() === 'admin',
    request_id: req.requestId,
  });
});

app.get('/api/admin/report', requireClerkAuth, ensureUserRecord, requireAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const [[kpis]] = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM users) AS total_users,
         (SELECT COUNT(*) FROM products) AS total_products,
         (SELECT COUNT(*) FROM orders) AS total_orders,
         (SELECT COALESCE(SUM(total_amount), 0) FROM orders) AS total_revenue,
         (SELECT COUNT(*) FROM users WHERE is_flagged = 1) AS flagged_users`
    );

    const [flaggedUsers] = await pool.query(
      `SELECT id, clerk_user_id, email, name, role, flagged_at, flag_reason
       FROM users
       WHERE is_flagged = 1
       ORDER BY flagged_at DESC, updated_at DESC
       LIMIT 100`
    );

    const [productAnalytics] = await pool.query(
      `SELECT
         p.id,
         p.name,
         p.category,
         p.price,
         SUM(CASE WHEN ua.event_type = 'view_product' THEN 1 ELSE 0 END) AS views,
         SUM(CASE WHEN ua.event_type = 'click_product' THEN 1 ELSE 0 END) AS clicks,
         SUM(CASE WHEN ua.event_type = 'add_to_cart' THEN 1 ELSE 0 END) AS add_to_carts,
         SUM(CASE WHEN ua.event_type = 'purchase' THEN 1 ELSE 0 END) AS purchases
       FROM products p
       LEFT JOIN user_activity ua ON ua.product_id = p.id
       GROUP BY p.id, p.name, p.category, p.price
       ORDER BY purchases DESC, add_to_carts DESC, views DESC
       LIMIT 100`
    );

    return res.status(200).json({
      kpis: {
        total_users: Number(kpis?.total_users || 0),
        total_products: Number(kpis?.total_products || 0),
        total_orders: Number(kpis?.total_orders || 0),
        total_revenue: Number(kpis?.total_revenue || 0),
        flagged_users: Number(kpis?.flagged_users || 0),
      },
      flagged_users: flaggedUsers || [],
      product_analytics: (productAnalytics || []).map((row) => ({
        id: Number(row.id || 0),
        name: row.name,
        category: row.category,
        price: Number(row.price || 0),
        views: Number(row.views || 0),
        clicks: Number(row.clicks || 0),
        add_to_carts: Number(row.add_to_carts || 0),
        purchases: Number(row.purchases || 0),
      })),
      request_id: req.requestId,
    });
  } catch (error) {
    logRouteError('/api/admin/report', req, error);
    return sendInternalError(res, req, 'Failed to load admin report');
  }
});

app.patch('/api/admin/users/:userId/flag', requireClerkAuth, ensureUserRecord, requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.userId || 0);
    if (!Number.isFinite(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid user id', request_id: req.requestId });
    }

    const shouldFlag = Boolean(req.body?.is_flagged);
    const reasonRaw = String(req.body?.flag_reason || '').trim();
    const reason = reasonRaw.slice(0, 255);

    const pool = getPool();
    const [existingRows] = await pool.query(
      `SELECT id, clerk_user_id, email, name, role, is_flagged, flagged_at, flag_reason
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    );
    const existing = existingRows?.[0];
    if (!existing) {
      return res.status(404).json({ error: 'User not found', request_id: req.requestId });
    }

    await pool.query(
      `UPDATE users
       SET is_flagged = ?,
           flagged_at = ?,
           flag_reason = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        shouldFlag ? 1 : 0,
        shouldFlag ? new Date() : null,
        shouldFlag ? (reason || 'Flagged by admin') : null,
        userId
      ]
    );
    if (shouldFlag) {
      await revokeFlaggedUserSignals(pool, userId);
    }

    const [updatedRows] = await pool.query(
      `SELECT id, clerk_user_id, email, name, role, is_flagged, flagged_at, flag_reason
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    );
    const user = updatedRows?.[0] || null;
    return res.status(200).json({
      user: user ? {
        id: Number(user.id || 0),
        clerk_user_id: user.clerk_user_id || null,
        email: user.email || null,
        name: user.name || null,
        role: user.role || 'customer',
        is_flagged: Boolean(user.is_flagged),
        flagged_at: user.flagged_at || null,
        flag_reason: user.flag_reason || null,
      } : null,
      request_id: req.requestId,
    });
  } catch (error) {
    logRouteError('/api/admin/users/:userId/flag', req, error);
    return sendInternalError(res, req, 'Failed to update user flag status');
  }
});

app.get('/api/cart', requireClerkAuth, ensureUserRecord, async (req, res) => {
  try {
    const pool = getPool();
    const [carts] = await pool.query(
      `SELECT id FROM carts WHERE user_id = ? LIMIT 1`,
      [req.auth.dbUserId]
    );
    const cartId = Number(carts?.[0]?.id || 0);
    if (!cartId) return res.status(200).json({ items: [] });

    const [rows] = await pool.query(
      `SELECT entry_id, entry_type, name, price, image_path, category, quantity, bundle_items_json, bundle_meta_json
       FROM cart_items
       WHERE cart_id = ?
       ORDER BY id ASC`,
      [cartId]
    );
    const items = rows.map((row) => ({
      id: row.entry_id,
      entry_type: row.entry_type,
      name: row.name,
      price: Number(row.price || 0),
      image_path: row.image_path || null,
      category: row.category || null,
      qty: Math.max(1, Number(row.quantity || 1)),
      bundle_items: row.bundle_items_json ? JSON.parse(row.bundle_items_json) : null,
      bundle_meta: row.bundle_meta_json ? JSON.parse(row.bundle_meta_json) : null,
    }));
    return res.status(200).json({ items });
  } catch (error) {
    logRouteError('/api/cart', req, error);
    return sendInternalError(res, req, 'Failed to fetch cart');
  }
});

app.put('/api/cart', requireClerkAuth, ensureUserRecord, async (req, res) => {
  try {
    const payloadItems = Array.isArray(req.body?.items) ? req.body.items : [];
    const normalized = payloadItems
      .map((item) => ({
        entry_id: String(item?.id || '').slice(0, 120),
        entry_type: String(item?.entry_type || 'item') === 'bundle' ? 'bundle' : 'item',
        name: String(item?.name || 'Product').slice(0, 255),
        price: Number(item?.price || 0),
        image_path: item?.image_path ? String(item.image_path).slice(0, 255) : null,
        category: item?.category ? String(item.category).slice(0, 100) : null,
        quantity: Math.max(1, Number(item?.qty || item?.quantity || 1)),
        bundle_items_json: item?.bundle_items ? JSON.stringify(item.bundle_items) : null,
        bundle_meta_json: item?.bundle_meta ? JSON.stringify(item.bundle_meta) : null,
      }))
      .filter((item) => item.entry_id && Number.isFinite(item.price) && item.price >= 0);

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        `INSERT INTO carts (user_id, clerk_user_id) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE clerk_user_id = VALUES(clerk_user_id), updated_at = CURRENT_TIMESTAMP`,
        [req.auth.dbUserId, req.auth.userId]
      );
      const [carts] = await conn.query(`SELECT id FROM carts WHERE user_id = ? LIMIT 1`, [req.auth.dbUserId]);
      const cartId = Number(carts?.[0]?.id || 0);
      if (!cartId) throw new Error('Failed to resolve cart id');

      await conn.query(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId]);
      for (const item of normalized) {
        await conn.query(
          `INSERT INTO cart_items
           (cart_id, entry_id, entry_type, name, price, image_path, category, quantity, bundle_items_json, bundle_meta_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            cartId,
            item.entry_id,
            item.entry_type,
            item.name,
            item.price,
            item.image_path,
            item.category,
            item.quantity,
            item.bundle_items_json,
            item.bundle_meta_json,
          ]
        );
      }
      await conn.commit();
      return res.status(200).json({ ok: true, items_saved: normalized.length });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    logRouteError('/api/cart', req, error);
    return sendInternalError(res, req, 'Failed to save cart');
  }
});

app.get('/api/bundles/popular', requireClerkAuth, ensureUserRecord, async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(20, Number(req.query.limit || 6)));
    const pool = getPool();
    const [rows] = await pool.query(
      `
      SELECT
        b.id AS bundle_id,
        b.name AS bundle_name,
        b.bundle_type,
        b.estimated_total_price,
        b.created_at,
        bi.product_id,
        bi.quantity,
        p.name AS product_name,
        p.price AS product_price,
        p.image_path AS product_image_path,
        p.category AS product_category
      FROM bundles b
      JOIN bundle_items bi ON bi.bundle_id = b.id
      JOIN products p ON p.id = bi.product_id
      ORDER BY b.created_at DESC, b.id DESC
      `
    );

    const byBundle = new Map();
    for (const row of rows) {
      const bundleId = Number(row.bundle_id || 0);
      if (!bundleId) continue;
      if (!byBundle.has(bundleId)) {
        byBundle.set(bundleId, {
          id: bundleId,
          name: String(row.bundle_name || 'Smart Bundle'),
          bundle_type: String(row.bundle_type || 'study'),
          estimated_total_price: Number(row.estimated_total_price || 0),
          created_at: row.created_at,
          items: [],
        });
      }
      byBundle.get(bundleId).items.push({
        id: Number(row.product_id || 0),
        name: String(row.product_name || 'Product'),
        price: Number(row.product_price || 0),
        image_path: row.product_image_path || null,
        category: row.product_category || null,
        qty: Math.max(1, Number(row.quantity || 1)),
      });
    }

    const bySignature = new Map();
    for (const bundle of byBundle.values()) {
      const signature = bundle.items
        .map((item) => `${item.id}:${item.qty}`)
        .sort()
        .join('|');
      if (!signature) continue;

      const total = bundle.estimated_total_price > 0
        ? bundle.estimated_total_price
        : bundle.items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 1)), 0);

      const existing = bySignature.get(signature);
      if (!existing) {
        bySignature.set(signature, {
          id: bundle.id,
          name: bundle.name,
          bundle_type: bundle.bundle_type,
          estimated_total_price: Number(total.toFixed(2)),
          times_saved: 1,
          created_at: bundle.created_at,
          items: bundle.items,
        });
        continue;
      }

      existing.times_saved += 1;
      if (new Date(bundle.created_at).getTime() > new Date(existing.created_at).getTime()) {
        existing.id = bundle.id;
        existing.name = bundle.name;
        existing.bundle_type = bundle.bundle_type;
        existing.estimated_total_price = Number(total.toFixed(2));
        existing.created_at = bundle.created_at;
        existing.items = bundle.items;
      }
    }

    const popular = Array.from(bySignature.values())
      .sort((a, b) => {
        if (b.times_saved !== a.times_saved) return b.times_saved - a.times_saved;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
      .slice(0, limit)
      .map((bundle) => ({
        ...bundle,
        item_count: bundle.items.length,
      }));

    return res.status(200).json(popular);
  } catch (error) {
    logRouteError('/api/bundles/popular', req, error);
    return sendInternalError(res, req, 'Failed to fetch popular bundles');
  }
});





app.use('/api', (_req, res) => {
  return res.status(404).json({ error: 'Not found' });
});

export default app;
