import crypto from 'node:crypto';
import mysql from 'mysql2/promise';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function toEmbeddingSeed(text, dimension = 64) {
  const hash = crypto.createHash('sha256').update(text).digest();
  const out = [];
  for (let i = 0; i < dimension; i += 1) {
    const a = hash[i % hash.length];
    const b = hash[(i + 7) % hash.length];
    const v = ((a << 8) | b) / 65535;
    out.push(Number((v * 2 - 1).toFixed(6)));
  }
  return out;
}

function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((x) => String(x || '').trim()).filter(Boolean);
  const str = String(raw || '').trim();
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) return parsed.map((x) => String(x || '').trim()).filter(Boolean);
  } catch {
    return str.split(',').map((x) => x.trim()).filter(Boolean);
  }
  return [];
}

function normVec(vec) {
  const sumSq = vec.reduce((sum, v) => sum + (Number(v) * Number(v)), 0);
  const mag = Math.sqrt(sumSq) || 1;
  return vec.map((v) => Number((Number(v) / mag).toFixed(8)));
}

async function getOpenAIEmbedding(inputText, { apiKey, model }) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: inputText,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`OpenAI embeddings failed (${response.status}): ${body.slice(0, 300)}`);
  }

  const data = await response.json();
  const embedding = data?.data?.[0]?.embedding;
  if (!Array.isArray(embedding) || !embedding.length) {
    throw new Error('OpenAI embeddings response missing vector');
  }
  return normVec(embedding.map((n) => Number(n)));
}

async function embedText(text, options) {
  const provider = String(options.provider || 'seed').toLowerCase();
  if (provider === 'openai' && options.apiKey) {
    const vec = await getOpenAIEmbedding(text, {
      apiKey: options.apiKey,
      model: options.model,
    });
    return {
      embedding: vec,
      model: options.model,
    };
  }

  const dim = Number(options.seedDimension || 64);
  return {
    embedding: normVec(toEmbeddingSeed(text, dim)),
    model: 'seed-hash-v1',
  };
}

async function main() {
  const host = requireEnv('DB_HOST');
  const port = Number(process.env.DB_PORT || 3306);
  const user = requireEnv('DB_USER');
  const password = process.env.DB_PASSWORD || '';
  const database = requireEnv('DB_NAME');
  const limit = Number(process.env.EMBEDDING_BACKFILL_LIMIT || 500);
  const mode = String(process.env.EMBEDDING_BACKFILL_MODE || 'missing').toLowerCase();
  const provider = String(process.env.EMBEDDING_PROVIDER || (process.env.OPENAI_API_KEY ? 'openai' : 'seed')).toLowerCase();
  const embeddingModel = String(process.env.EMBEDDING_MODEL || 'text-embedding-3-small');
  const seedDimension = Number(process.env.EMBEDDING_SEED_DIMENSION || 64);
  const openAIApiKey = process.env.OPENAI_API_KEY || '';

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
    const sqlMissing = `
      SELECT p.id, p.name, p.category, p.tags
      FROM products p
      LEFT JOIN product_embeddings pe ON pe.product_id = p.id
      WHERE pe.product_id IS NULL
      ORDER BY p.id ASC
      LIMIT ?
    `;
    const sqlAll = `
      SELECT p.id, p.name, p.category, p.tags
      FROM products p
      ORDER BY p.id ASC
      LIMIT ?
    `;
    const [rows] = await pool.query(mode === 'all' ? sqlAll : sqlMissing, [limit]);

    if (!rows.length) {
      console.log('No products pending embeddings.');
      return;
    }

    let applied = 0;
    for (const row of rows) {
      const tagTokens = parseTags(row.tags);
      const text = [
        String(row.name || ''),
        String(row.category || ''),
        tagTokens.join(', '),
      ].join(' | ');
      const embedded = await embedText(text, {
        provider,
        apiKey: openAIApiKey,
        model: embeddingModel,
        seedDimension,
      });
      const embedding = embedded.embedding;

      await pool.query(
        `
        INSERT INTO product_embeddings (product_id, embedding, embedding_model, embedding_dimension)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          embedding = VALUES(embedding),
          embedding_model = VALUES(embedding_model),
          embedding_dimension = VALUES(embedding_dimension),
          generated_at = CURRENT_TIMESTAMP
        `,
        [row.id, JSON.stringify(embedding), embedded.model, embedding.length]
      );
      applied += 1;
    }

    console.log(`Backfilled embeddings for ${applied} product(s). provider=${provider} mode=${mode}`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
