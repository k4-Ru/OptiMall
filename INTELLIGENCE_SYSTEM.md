# OptiMall Intelligence System Overview

This document explains what makes OptiMall "intelligent", what components are used, and how key flows work.

## 1) What makes the system intelligent

OptiMall is a **hybrid decision system** (rules + behavioral data + optional ML scoring), not just static filtering.

Core traits:
- Uses user context (activity history, cart/purchase patterns).
- Uses multi-signal ranking (lexical, fuzzy, semantic, behavior/popularity).
- Produces constrained outputs (budget-aware bundles).
- Logs outcomes and feedback for continuous offline improvement.

It is not fully autonomous online learning yet (weights are not continuously self-updated in real time).

### Weights used (current)
- **Hybrid Smart Mode candidate blend**:
  - semantic similarity (embedding): **0.55**
  - lexical/query match: **0.25**
  - behavior/popularity: **0.20**
- **Model blend (when active model is applied)**:
  - controlled by `MODEL_BLEND_ALPHA` (default **0.7** in backend).
  - effective blend: `alpha * model_score + (1 - alpha) * heuristic_score`.
- **Trained model weights**:
  - learned offline in `scripts/train_ranker.mjs` (logistic model coefficients + bias).
  - stored in model artifact JSON and loaded from `model_registry.artifact_uri`.
  - these are **not** continuously updated in real time; they change only after retraining/re-activation.

---

## 2) Main intelligence components

## Frontend Intelligence (Orchestration)
- File: `src/pages/HomePage.jsx`
- Handles:
  - Query normalization
  - Fuzzy lexical scoring
  - Intent detection
  - Hybrid reranking before bundle generation request

## Backend Intelligence (Execution + Persistence)
- File: `api/server.js`
- Handles:
  - Recommendation/bundle pipelines
  - Popularity and behavior-based boosts
  - Model inference blending (if active model exists)
  - Logging exposures/outcomes/inference
  - Abuse/anomaly controls

## Data + Learning Tables (examples)
- `user_activity`, `user_interactions`
- `recommendation_exposures`, `recommendation_outcomes`
- `product_metadata`, `product_embeddings`, `user_embeddings`
- `user_product_features_daily`
- `model_registry`, `model_inference_logs`
- `bundles`, `bundle_items`, `bundle_ratings`

## Engine taxonomy (what engines exist)

- **Promotional Intelligence Engine**
  - ranks promotable products from preference, value, rating, popularity, and behavior signals.
- **Real-Time Recommendation Engine**
  - reorders suggestions using latest user/session activity context.
- **Bundle Optimization Engine**
  - constructs budget-constrained bundles and tier scenarios.
- **Anomaly Detection Engine**
  - detects suspicious behavior spikes and can restrict risky actions.
- **ML Reranking Engine (optional)**
  - blends trained model scores with heuristic scores when an active model is available.
- **Feedback/Learning Engine (offline loop)**
  - uses logged exposures/outcomes/activity/ratings for feature builds and retraining.

---

## 3) Search behavior

## Normal Mode Search
- Used for browsing and finding products quickly.
- Primarily lexical/fuzzy matching against product name/category/tags.

## Smart Mode Step 1 Search
- Used as **intent seed** for bundle generation.
- Input is not just filtered list display; it drives candidate selection and tiered bundle optimization.

---

## 4) Fuzzy matching and text logic

Implementation is in `HomePage.jsx`.

Methods used:
- `normalizeSearchText(...)`
  - lowercases, strips punctuation, collapses spaces.
- `levenshtein(a, b)`
  - edit-distance function for typo tolerance.
- `fuzzyTokenMatch(queryToken, candidateToken)`
  - exact/substring checks + first-letter + length bounds + Levenshtein threshold.
- `searchScoreForProduct(...)` and stricter variant for smart matching
  - weighted lexical scoring over name/category/tags.

This is why near-typos can still match.

---

## 5) Intent detection

Intent is inferred from Step 1 query + top matched products:
- Uses an intent catalog (examples: kitchen, gaming, study, fitness, travel, home).
- Produces a ranked intent score using a hybrid of:
  - lexical intent fit
  - matched-product intent alignment
  - category behavior alignment

Output includes intent key/label/confidence used by Smart Mode.

### Intent detection details (current implementation)
- Input to intent detection:
  - normalized Step 1 query text
  - top matched products from strict/fuzzy retrieval
- Intent catalog:
  - each intent contains a key, display label, keyword list, and category hints.
- Per-intent scoring:
  1. **Lexical intent score**
     - runs query-vs-intent text match using the same lexical/fuzzy scoring utilities.
  2. **Semantic/structure proxy score**
     - counts how many matched products align to the intent (keywords/category alignment).
  3. **Behavior/category score**
     - checks matched-product category overlap with intent category hints.
- Hybrid intent score combines those signals with weighted blend:
  - semantic/structure proxy: `0.55`
  - lexical: `0.25`
  - behavior/category: `0.20`
- Signal differentiation:
  - **Semantic/structure proxy (0.55)**:
    - concept-level alignment of retrieved products to an intent cluster.
    - asks: “Do matched products semantically belong to this intent?”
  - **Lexical (0.25)**:
    - word-level query-to-intent overlap (exact/fuzzy token matching).
    - asks: “Do typed words literally match this intent?”
  - **Behavior/category (0.20)**:
    - context-level alignment via category overlap and shopping structure hints.
    - asks: “Does product-category context support this intent?”
- Safety floor:
  - if lexical score is weak/zero, intent score is down-weighted to reduce semantic drift.
- Ranking + confidence:
  - intents are sorted descending by hybrid score.
  - top intent is accepted only if above minimum threshold.
  - confidence is bounded to a stable range before UI display (prevents extreme noisy values).
- Fallback behavior:
  - if no intent clears threshold, Smart Mode continues with broader candidate pool and bundle scoring.
  - user override (when used) replaces detected intent key for downstream penalties/constraints.

### Intent detection algorithm (step-by-step)
1. **Normalize query**
   - lowercase + punctuation cleanup + token normalization.
2. **Build initial retrieval set**
   - run strict lexical scoring first.
   - if strict retrieval is too sparse, run fuzzy retrieval (Levenshtein-assisted token matching).
   - take top matched products as intent evidence set.
3. **Score each intent in catalog**
   - for every intent label:
     - compute lexical query-to-intent score.
     - compute aligned-product ratio from evidence set (`aligned_products / total_evidence_products`).
     - compute category-support ratio from evidence product categories.
4. **Apply weighted fusion**
   - `intent_score = 0.55 * semantic_structure + 0.25 * lexical + 0.20 * category_behavior`
5. **Apply safety floor**
   - if lexical signal is weak/zero, down-weight intent score to reduce off-topic semantic matches.
6. **Rank intents**
   - sort by `intent_score` descending and pick top candidate.
7. **Threshold gate**
   - accept top intent only if it passes minimum confidence threshold.
   - otherwise mark as low-confidence/no-dominant-intent and continue with broader bundle logic.
8. **Confidence shaping**
   - clamp confidence into stable display range for UI consistency.
9. **User override (optional)**
   - if user chooses a different intent, override detected intent for downstream ranking/penalties.

### What the detector uses vs does not use
- Uses:
  - Step 1 query text
  - product names/categories/tags from matched products
  - lexical/fuzzy retrieval outputs
  - category consistency signals
- Does not directly require:
  - a fixed hardcoded mapping from every keyword to one intent
  - real-time model retraining at inference time

### Failure cases and mitigation
- **Case: vague query** (e.g., “good stuff”)
  - effect: low lexical specificity, flatter intent scores.
  - mitigation: fallback to broader pool and budget/value constraints.
- **Case: noisy tags/categories**
  - effect: incorrect category-support term.
  - mitigation: lexical floor + intent misalignment penalties downstream.
- **Case: typo-heavy query**
  - effect: strict retrieval drops.
  - mitigation: fuzzy retrieval path (Levenshtein token logic).

---

## 6) Hybrid product ranking for Smart Mode

Before requesting bundle optimization, candidates are reranked using:
- **Semantic signal** (embedding cosine similarity, if vectors available)
- **Lexical signal** (strict/fuzzy query score)
- **Behavior signal** (outcome boost / popularity score)

Current blend used in code:
- semantic ~ 55%
- lexical ~ 25%
- behavior/popularity ~ 20%

Safety controls:
- If lexical is zero, score is penalized (prevents semantic drift).
- Intent misalignment gets additional penalty.
- Complementary accessories are allowed as controlled exceptions.

---

## 7) Bundle generation by budget

Pipeline:
1. Build scenario budgets (starter/balanced/max-style tiers).
2. For each budget, call intelligence pipeline endpoint.
3. Backend returns optimized bundle candidate list and score.
4. Frontend applies dedupe guards:
   - no duplicate product IDs
   - no duplicate product type keys
5. Dynamic discount is applied from quality/diversity/budget-fit/final score factors.

Result: multiple budget tiers with item lists, totals, remaining budget, and score breakdown.

### Dynamic bundle discount logic
- Discount is **not fixed**; it increments based on bundle quality signals.
- Base rate starts at `0.08` (8%), then adds factors from:
  - item count (more complete bundle -> higher factor)
  - budget spend fit (closer to budget target -> higher factor)
  - quality score
  - diversity score
  - budget compatibility score
  - final scenario score
- Final rate is clamped to:
  - minimum `0.08` (8%) when bundle has at least 2 items
  - maximum `0.35` (35%)
- Discount value = `subtotal * discountRate`, then:
  - `discountedTotal = subtotal - discountValue`
  - `remaining = budget - discountedTotal`

---

## 8) "Why this bundle" explanation

Explanations are generated from computed signals:
- goal match
- budget fit
- priority emphasis
- category diversity

This gives a human-readable summary of why a bundle was selected.

---

## 9) Model inference (optional layer)

If an active model is available:
- Backend loads artifact from `model_registry`.
- Builds feature vectors per candidate.
- Scores candidates via model output.
- Blends model score with heuristic score.
- Logs rows into `model_inference_logs`.

If no model or fallback occurs, heuristic path still works.

---

## 10) Learning loop

Signals written:
- Exposure logs (`recommendation_exposures`)
- Outcome logs (`recommendation_outcomes`)
- Activity logs (`user_activity`)
- Bundle ratings (`bundle_ratings`)

Training flow (offline):
1. Build daily features (`user_product_features_daily`)
2. Train ranking model (scripts)
3. Register/activate model
4. Serve with blended inference

This is the current "learns over time" mechanism.

---

## 11) Bundle ratings and feedback

Smart Mode supports bundle review capture:
- Rating scale: `1..4`
- Optional reason tags
- Generation context snapshot
- Stage support (`generated`, `post_purchase`)
- Signature-based identity for bundle composition

`bundle_id` can be linked directly, and signature fallback resolves missing IDs in backend.

---

## 12) Anomaly and trust controls

Backend checks suspicious spikes (add-to-cart/purchase/checkout patterns).
- Can block actions and flag users.
- Flagged-user signals are excluded from key analytics/popularity computations.

This protects intelligence quality from manipulated behavior.

---

## 13) Important practical notes

- Intelligence quality depends on data quality:
  - product tags/category quality
  - embeddings coverage
  - outcome logging completeness
- If results look off, first inspect:
  - product metadata quality
  - intent penalties/thresholds
  - exposure/outcome population
