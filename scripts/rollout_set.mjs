import fs from 'node:fs/promises';
import path from 'node:path';

function getArg(name, fallback = null) {
  const pref = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(pref));
  if (!found) return fallback;
  return found.slice(pref.length);
}

function parsePercent(input) {
  const n = Number(input);
  if (!Number.isFinite(n)) throw new Error('Invalid percent');
  return Math.max(0, Math.min(100, Math.round(n)));
}

async function main() {
  const stage = getArg('stage', '').toLowerCase();
  const explicitPercent = getArg('percent', null);

  const stageMap = {
    canary: 5,
    pilot: 25,
    half: 50,
    full: 100,
    off: 0,
  };

  const percent = explicitPercent != null
    ? parsePercent(explicitPercent)
    : (stageMap[stage] ?? null);

  if (percent == null) {
    throw new Error('Pass --percent=<0..100> or --stage=canary|pilot|half|full|off');
  }

  const envPath = path.resolve('.env');
  const raw = await fs.readFile(envPath, 'utf8');
  const lines = raw.split(/\r?\n/);
  let found = false;
  const nextLines = lines.map((line) => {
    if (line.startsWith('EXPERIMENT_HYBRID_PERCENT=')) {
      found = true;
      return `EXPERIMENT_HYBRID_PERCENT=${percent}`;
    }
    return line;
  });

  if (!found) nextLines.push(`EXPERIMENT_HYBRID_PERCENT=${percent}`);

  await fs.writeFile(envPath, `${nextLines.join('\n').replace(/\n+$/, '')}\n`, 'utf8');

  console.log(JSON.stringify({ ok: true, updated_env: envPath, EXPERIMENT_HYBRID_PERCENT: percent }));
  console.log('Restart api/dev process to apply new rollout percent.');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
