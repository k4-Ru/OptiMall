import mysql from 'mysql2/promise';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

async function main() {
  const host = requireEnv('DB_HOST');
  const port = Number(process.env.DB_PORT || 3306);
  const user = requireEnv('DB_USER');
  const password = process.env.DB_PASSWORD || '';
  const database = requireEnv('DB_NAME');
  const limit = Number(process.env.MODEL_LIST_LIMIT || 30);

  const pool = await mysql.createPool({ host, port, user, password, database, waitForConnections: true, connectionLimit: 3 });
  try {
    const [rows] = await pool.query(
      `
      SELECT id, model_key, model_version, status, framework, artifact_uri, activated_at, created_at, updated_at
      FROM model_registry
      ORDER BY COALESCE(activated_at, created_at) DESC
      LIMIT ?
      `,
      [limit]
    );

    const output = rows.map((r) => ({
      id: Number(r.id),
      model_key: r.model_key,
      model_version: r.model_version,
      status: r.status,
      framework: r.framework,
      artifact_uri: r.artifact_uri,
      activated_at: r.activated_at,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));

    console.log(JSON.stringify({ count: output.length, models: output }, null, 2));
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
