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

function readValidationAuc(metricsRaw) {
  try {
    const metrics = typeof metricsRaw === 'string' ? JSON.parse(metricsRaw) : metricsRaw;
    return Number(metrics?.validation?.auc || 0);
  } catch {
    return 0;
  }
}

async function main() {
  const host = requireEnv('DB_HOST');
  const port = Number(process.env.DB_PORT || 3306);
  const user = requireEnv('DB_USER');
  const password = process.env.DB_PASSWORD || '';
  const database = requireEnv('DB_NAME');

  const modelVersion = getArg('version', process.env.MODEL_VERSION || '');
  if (!modelVersion) throw new Error('Pass --version=<model_version> or set MODEL_VERSION');

  const minValAuc = Number(process.env.MODEL_PROMOTE_MIN_VAL_AUC || 0.5);

  const pool = await mysql.createPool({ host, port, user, password, database, waitForConnections: true, connectionLimit: 3 });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT id, model_key, model_version, status, metrics FROM model_registry WHERE model_version = ? LIMIT 1`,
      [modelVersion]
    );
    const target = rows?.[0];
    if (!target) throw new Error(`Model version not found: ${modelVersion}`);

    const valAuc = readValidationAuc(target.metrics);
    if (valAuc < minValAuc) {
      throw new Error(`Activation blocked: validation AUC ${valAuc.toFixed(4)} is below threshold ${minValAuc.toFixed(4)}`);
    }

    await conn.query(
      `UPDATE model_registry
       SET status = CASE
         WHEN model_version = ? THEN 'active'
         WHEN model_key = ? AND status = 'active' THEN 'archived'
         ELSE status
       END,
       activated_at = CASE WHEN model_version = ? THEN NOW() ELSE activated_at END,
       updated_at = CURRENT_TIMESTAMP,
       notes = CASE WHEN model_version = ? THEN CONCAT(COALESCE(notes, ''), '\n[activate] ', NOW()) ELSE notes END
       WHERE model_version = ? OR (model_key = ? AND status = 'active')`,
      [modelVersion, target.model_key, modelVersion, modelVersion, modelVersion, target.model_key]
    );

    await conn.commit();

    console.log(JSON.stringify({
      ok: true,
      activated_model_version: modelVersion,
      model_key: target.model_key,
      validation_auc: Number(valAuc.toFixed(4)),
      threshold: Number(minValAuc.toFixed(4)),
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
