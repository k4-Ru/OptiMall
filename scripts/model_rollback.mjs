import mysql from 'mysql2/promise';

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function getArg(name, fallback = null) {
  const pref = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(pref));
  if (!found) return fallback;
  return found.slice(pref.length);
}

async function main() {
  const host = requireEnv('DB_HOST');
  const port = Number(process.env.DB_PORT || 3306);
  const user = requireEnv('DB_USER');
  const password = process.env.DB_PASSWORD || '';
  const database = requireEnv('DB_NAME');

  const explicitVersion = getArg('version', process.env.MODEL_VERSION || null);

  const pool = await mysql.createPool({ host, port, user, password, database, waitForConnections: true, connectionLimit: 3 });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [activeRows] = await conn.query(
      `SELECT id, model_key, model_version FROM model_registry WHERE status = 'active' ORDER BY activated_at DESC, updated_at DESC LIMIT 1`
    );
    const active = activeRows?.[0] || null;

    if (!active) throw new Error('No active model found to rollback from.');

    let targetVersion = explicitVersion;
    if (!targetVersion) {
      const [candidates] = await conn.query(
        `
        SELECT model_version
        FROM model_registry
        WHERE model_key = ?
          AND model_version <> ?
          AND status IN ('archived','candidate')
        ORDER BY COALESCE(activated_at, created_at) DESC
        LIMIT 1
        `,
        [active.model_key, active.model_version]
      );
      targetVersion = candidates?.[0]?.model_version || null;
    }

    if (!targetVersion) {
      throw new Error('No rollback candidate found. Pass --version=<model_version> explicitly.');
    }

    await conn.query(
      `UPDATE model_registry
       SET status = CASE
         WHEN model_version = ? THEN 'active'
         WHEN model_version = ? THEN 'archived'
         ELSE status
       END,
       activated_at = CASE WHEN model_version = ? THEN NOW() ELSE activated_at END,
       updated_at = CURRENT_TIMESTAMP,
       notes = CASE
         WHEN model_version = ? THEN CONCAT(COALESCE(notes, ''), '\n[rollback-activated] ', NOW())
         WHEN model_version = ? THEN CONCAT(COALESCE(notes, ''), '\n[rollback-archived] ', NOW())
         ELSE notes
       END
       WHERE model_version IN (?, ?)
      `,
      [targetVersion, active.model_version, targetVersion, targetVersion, active.model_version, targetVersion, active.model_version]
    );

    await conn.commit();

    console.log(JSON.stringify({
      ok: true,
      previous_active: active.model_version,
      new_active: targetVersion,
      model_key: active.model_key,
    }));
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
