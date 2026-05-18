# OptiMall Audit: Recommendation Lifecycle, Products, Bundling, Python Engines

Date: 2026-05-19

## Scope
- Frontend lifecycle: Home, Products, Recommendations, Activity, Smart Bundles
- Node API orchestration: `/api/products`, `/api/activity`, `/api/recommendations`, `/api/intelligence/*`
- Python engines: promotional, realtime, bundle, anomaly, pipeline
- Delivery status after Phases 1–5

## Executive Status
- Product discovery path works.
- Activity capture path works.
- Recommendations path works and now consumes recent user activity.
- Smart Bundles page is now live-integrated with intelligence pipeline.
- Engine quality is improved (tag parsing, recency weighting, bounded knapsack strategy).
- Reliability/observability is improved (request IDs, upstream retry/backoff, error classification).
- Baseline tests now exist and pass (Python engine unit tests + smoke script).

## End-to-End Lifecycle Audit

### 1) Product Discovery -> `GET /api/products`
- Status: Works
- Evidence:
  - Frontend uses `src/lib/api.js -> getProducts()`
  - API returns DB products ordered by latest
  - Home and Products pages render DB output
- Remaining gaps:
  - No backend pagination/filter query support yet.

### 2) Signal Capture -> `POST /api/activity`
- Status: Works
- Evidence:
  - Home page and Activity page submit events
  - API enforces auth and stores user-scoped activity rows
- Remaining gaps:
  - No anti-spam/rate-limit and no event dedup policy.

### 3) Recommendations -> `POST /api/recommendations`
- Status: Works and improved
- What changed:
  - API now fetches recent user activity from DB
  - API passes `activity_events` + `latest_event` to Python recommendation flow
  - Uses DB user id for `user_id`
- Remaining gaps:
  - No explicit personalization threshold switch in API output metadata.

### 4) Bundling / Smart Bundles -> `POST /api/intelligence/pipeline`
- Status: Works and integrated
- What changed:
  - `SmartBundlesPage` now calls pipeline endpoint (no static bundle list)
  - Shared payload contract normalizes/validates pipeline inputs
  - Backend hydrates product catalog and activity when missing
- Remaining gaps:
  - No persisted “bundle accepted / ignored” feedback loop yet.

## Python Engine Audit

### Promotional Engine (`promotional.py`)
- Works: Yes
- Improvements:
  - Activity boosts now include recency decay.
- Remaining gaps:
  - Still rules-based constants; no learned weighting.

### Realtime Engine (`realtime.py`)
- Works: Yes
- Behavior:
  - Reranks by latest event and preference affinity.
- Remaining gaps:
  - Session-sequence context is limited to one latest event.

### Bundle Engine (`bundle.py`)
- Works: Yes
- Improvements:
  - Hybrid strategy:
    - `knapsack_bounded` for top candidates
    - `greedy_ratio` fallback for larger state
- Remaining gaps:
  - No diversity constraints (category spread, vendor spread).

### Anomaly Engine (`anomaly.py`)
- Works: Yes
- Behavior:
  - Threshold-based risk scoring.
- Remaining gaps:
  - No adaptive baseline by user history.

## Reliability + Observability Audit
- Added request ID middleware in Node API (`x-request-id` in/out).
- Python upstream calls now support retry/backoff for transient errors.
- Upstream failure classes added:
  - `UPSTREAM_RESPONSE_ERROR`
  - `UPSTREAM_TIMEOUT`
  - `UPSTREAM_UNREACHABLE`
- Error payloads now include `request_id` and `error_type`.
- Remaining gaps:
  - No centralized log sink/dashboard yet.

## Test & Gate Audit (Phase 5)
- Added Python unit tests:
  - `python-engine/tests/test_engines.py`
  - Covers tag parsing, promotional, realtime, bundle, anomaly paths
- Added scripts:
  - `npm run test:python`
  - `npm run test:smoke` (tests + build)
- Current result:
  - `test:python` passes
  - `test:smoke` passes
- Remaining gaps:
  - No automated API integration tests yet for Node endpoints.

## Phase Plan Status
- Phase 1 (Contract + Integration): Completed
- Phase 2 (Personalization Loop): Completed
- Phase 3 (Engine Quality): Completed
- Phase 4 (Reliability + Observability): Completed
- Phase 5 (Tests + Gates): Completed (baseline version)

## Remaining Priority Gaps
1. Add Node API integration tests (`/api/products`, `/api/activity`, `/api/recommendations`, `/api/intelligence/pipeline`).
2. Add activity abuse controls (rate limiting + duplicate suppression).
3. Add personalization maturity flags in responses (cold-start vs behavior-driven).
4. Add log aggregation and request tracing across Node/Python processes.

## Final Verdict
- The project is now operational end-to-end for product discovery, activity capture, recommendation, and smart bundling with measurable quality improvements.
- Main remaining work is hardening and test depth (API integration tests + operational controls), not core functionality.
