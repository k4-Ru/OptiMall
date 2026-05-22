# Package Scripts Reference

This file explains the `scripts` in [`package.json`](/Users/carlnicolas/dev/OptiMall/package.json).

## Development

- `npm run dev`
  - Starts the Vite frontend dev server.
- `npm run api:dev`
  - Starts the local API server (`api/dev.js`) with `.env`.
- `npm run dev:full`
  - Starts API + frontend together in one command.
- `npm run dev:fullstack`
  - Runs `scripts/dev_fullstack.sh` (project full-stack dev helper).
- `npm run dev:vercel`
  - Runs `vercel dev` for local Vercel-style routing/runtime.

## Build and Preview

- `npm run build`
  - Builds production frontend assets using Vite.
- `npm run preview`
  - Serves the built frontend locally for preview.

## Testing

- `npm run test:api`
  - Runs Node API tests in `api/tests/*.test.js`.
- `npm run test:python`
  - Runs Python engine tests from `python-engine/tests`.
- `npm run test:smoke`
  - Runs smoke test script `scripts/smoke_intelligence.sh`.

## Embeddings

- `npm run embeddings:backfill`
  - Backfills product embeddings into DB.
- `npm run embeddings:backfill:users`
  - Backfills user embeddings into DB.
- `npm run embeddings:backfill:all`
  - Runs product + user embeddings backfill sequentially.

## Feature Store

- `npm run features:build:daily`
  - Builds daily user-product features used by ranking/training.

## Model Training and Model Registry

- `npm run model:train`
  - Trains the ranking model and writes artifact + registry record.
- `npm run model:list`
  - Lists models in `model_registry`.
- `npm run model:activate`
  - Sets a model version as active for serving.
- `npm run model:rollback`
  - Rolls back active model to a previous version.

## Rollout and Guardrails

- `npm run rollout:set`
  - Sets recommendation rollout / experiment config.
- `npm run rollout:guard`
  - Runs rollout safety checks (fallback/error/health style checks).

## Operations

- `npm run ops:retrain`
  - Retraining pipeline helper for scheduled/ops use.
- `npm run ops:drift-check`
  - Checks for drift in recommendation/training signals.
- `npm run ops:weekly-report`
  - Produces weekly operations/reporting output.

## Typical Flows

- Local app dev: `npm run dev:full`
- Validate core behavior: `npm run test:api` then `npm run test:smoke`
- Refresh learning data: `npm run features:build:daily`
- Train and deploy model:
  - `npm run model:train`
  - `npm run model:list`
  - `npm run model:activate`
- Monitor after release:
  - `npm run rollout:guard`
  - `npm run ops:drift-check`
  - `npm run ops:weekly-report`
