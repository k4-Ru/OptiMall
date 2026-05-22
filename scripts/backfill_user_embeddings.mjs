import mysql from 'mysql2/promise';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
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

function normVec(vec) {
  const sumSq = vec.reduce((sum, v) => sum + (v * v), 0);
  const mag = Math.sqrt(sumSq) || 1;
  return vec.map((v) => Number((v / mag).toFixed(8)));
}

function weightedAverage(vectors, weights, dimension) {
  const acc = new Array(dimension).fill(0);
  let totalWeight = 0;

  for (let i = 0; i < vectors.length; i += 1) {
    const v = vectors[i];
    const w = Number(weights[i] || 0);
    if (!v || !v.length || w <= 0) continue;
    totalWeight += w;
    for (let j = 0; j < dimension; j += 1) {
      acc[j] += Number(v[j] || 0) * w;
    }
  }

  if (totalWeight <= 0) return null;
  return normVec(acc.map((x) => x / totalWeight));
}

function eventWeight(eventType) {
  const key = String(eventType || '').toLowerCase();
  if (key === 'view_product') return 0.8;
  if (key === 'click_product') return 1.2;
  if (key === 'add_to_cart') return 2.5;
  if (key === 'purchase') return 4.0;
  if (key === 'search') return 0.3;
  return 0.4;
}

async function main() {
  const host = requireEnv('DB_HOST');
  const port = Number(process.env.DB_PORT || 3306);
  const user = requireEnv('DB_USER');
  const password = process.env.DB_PASSWORD || '';
  const database = requireEnv('DB_NAME');
  const userLimit = Number(process.env.USER_EMBEDDING_BACKFILL_LIMIT || 300);
  const interactionWindowDays = Number(process.env.USER_EMBEDDING_WINDOW_DAYS || 120);
  const defaultModel = String(process.env.EMBEDDING_MODEL || 'text-embedding-3-small');

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
    const [users] = await pool.query(
      `
      SELECT DISTINCT ua.user_id
      FROM user_activity ua
      WHERE ua.user_id IS NOT NULL
      ORDER BY ua.user_id ASC
      LIMIT ?
      `,
      [userLimit]
    );

    if (!users.length) {
      console.log('No users with activity found for embedding backfill.');
      return;
    }

    let applied = 0;

    for (const row of users) {
      const uid = Number(row.user_id || 0);
      if (!uid) continue;

      const [events] = await pool.query(
        `
        SELECT
          ua.event_type,
          ua.created_at,
          pe.embedding,
          pe.embedding_model,
          pe.embedding_dimension
        FROM user_activity ua
        JOIN product_embeddings pe ON pe.product_id = ua.product_id
        WHERE ua.user_id = ?
          AND ua.product_id IS NOT NULL
          AND ua.created_at >= NOW() - INTERVAL ? DAY
        ORDER BY ua.created_at DESC
        LIMIT 500
        `,
        [uid, interactionWindowDays]
      );

      if (!events.length) continue;

      const modelGroups = new Map();
      for (const ev of events) {
        const model = String(ev.embedding_model || defaultModel);
        if (!modelGroups.has(model)) modelGroups.set(model, []);
        modelGroups.get(model).push(ev);
      }

      const bestModel = [...modelGroups.entries()].sort((a, b) => b[1].length - a[1].length)[0]?.[0] || defaultModel;
      const candidateEvents = modelGroups.get(bestModel) || [];
      if (!candidateEvents.length) continue;

      const dim = Number(candidateEvents[0].embedding_dimension || 0);
      if (!dim) continue;

      const vectors = [];
      const weights = [];

      for (const ev of candidateEvents) {
        const vec = parseEmbedding(ev.embedding);
        if (!vec || vec.length !== dim) continue;
        vectors.push(vec);
        weights.push(eventWeight(ev.event_type));
      }

      const userVec = weightedAverage(vectors, weights, dim);
      if (!userVec) continue;

      await pool.query(
        `
        INSERT INTO user_embeddings (user_id, embedding, embedding_model, embedding_dimension, source_window_days)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          embedding = VALUES(embedding),
          embedding_model = VALUES(embedding_model),
          embedding_dimension = VALUES(embedding_dimension),
          source_window_days = VALUES(source_window_days),
          generated_at = CURRENT_TIMESTAMP
        `,
        [uid, JSON.stringify(userVec), bestModel, dim, interactionWindowDays]
      );

      applied += 1;
    }

    console.log(`Backfilled user embeddings for ${applied} user(s).`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
