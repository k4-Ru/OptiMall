import { spawn } from 'node:child_process';

function run(cmd, args = [], env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', env, shell: false });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

function envWith(extra) {
  return { ...process.env, ...extra };
}

async function main() {
  const featureWindow = String(process.env.FEATURE_BUILD_WINDOW_DAYS || 30);
  const featureLimit = String(process.env.FEATURE_BUILD_LIMIT || 50000);
  const trainWindow = String(process.env.TRAIN_WINDOW_DAYS || 120);
  const trainRows = String(process.env.TRAIN_MAX_ROWS || 100000);
  const autoActivate = String(process.env.OPS_AUTO_ACTIVATE || 'false').toLowerCase() === 'true';
  const modelVersion = process.env.MODEL_VERSION || `ranking_lr_${new Date().toISOString().slice(0, 10)}`;

  console.log(JSON.stringify({ step: 'features_build_start', featureWindow, featureLimit }));
  await run('node', ['--env-file=.env', 'scripts/build_user_product_features_daily.mjs'], envWith({
    FEATURE_BUILD_WINDOW_DAYS: featureWindow,
    FEATURE_BUILD_LIMIT: featureLimit,
  }));

  console.log(JSON.stringify({ step: 'model_train_start', trainWindow, trainRows, modelVersion }));
  await run('node', ['--env-file=.env', 'scripts/train_ranker.mjs'], envWith({
    TRAIN_WINDOW_DAYS: trainWindow,
    TRAIN_MAX_ROWS: trainRows,
    MODEL_VERSION: modelVersion,
  }));

  if (autoActivate) {
    console.log(JSON.stringify({ step: 'model_activate_start', modelVersion }));
    await run('node', ['--env-file=.env', 'scripts/model_activate.mjs', `--version=${modelVersion}`], envWith({}));
  }

  console.log(JSON.stringify({
    ok: true,
    model_version: modelVersion,
    auto_activate: autoActivate,
  }));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
