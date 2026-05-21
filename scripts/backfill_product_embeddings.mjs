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

async function main() {
  const host = requireEnv('DB_HOST');
  const port = Number(process.env.DB_PORT || 3306);
  const user = requireEnv('DB_USER');
  const password = process.env.DB_PASSWORD || '';
  const database = requireEnv('DB_NAME');
  const limit = Number(process.env.EMBEDDING_BACKFILL_LIMIT || 500);

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
    const [rows] = await pool.query(
      `
      SELECT p.id, p.name, p.category, p.tags
      FROM products p
      LEFT JOIN product_embeddings pe ON pe.product_id = p.id
      WHERE pe.product_id IS NULL
      ORDER BY p.id ASC
      LIMIT ?
      `,
      [limit]
    );

    if (!rows.length) {
      console.log('No products pending embeddings.');
      return;
    }

    for (const row of rows) {
      const text = [
        String(row.name || ''),
        String(row.category || ''),
        String(row.tags || ''),
      ].join(' | ');
      const embedding = toEmbeddingSeed(text, 64);

      await pool.query(
        `
        INSERT INTO product_embeddings (product_id, embedding, embedding_model, embedding_dimension)
        VALUES (?, ?, 'seed-hash-v1', ?)
        ON DUPLICATE KEY UPDATE
          embedding = VALUES(embedding),
          embedding_model = VALUES(embedding_model),
          embedding_dimension = VALUES(embedding_dimension),
          generated_at = CURRENT_TIMESTAMP
        `,
        [row.id, JSON.stringify(embedding), embedding.length]
      );
    }

    console.log(`Backfilled embeddings for ${rows.length} product(s).`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
