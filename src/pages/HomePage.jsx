import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import Header from '../components/Header';
import { getPopularBundles, getProducts, postActivity, postIntelligencePipeline, postSaveBundle } from '../lib/api';
import { useCommerce } from '../lib/commerceContext';
import NormalMode from './home/NormalMode';
import SmartMode from './home/SmartMode';

const INTENT_CATALOG = [
  { key: 'kitchen', label: 'Kitchen Essentials', keywords: ['kitchen', 'pan', 'cookware', 'utensil', 'pot'], categories: ['Kitchen'] },
  { key: 'gaming', label: 'Gaming Setup', keywords: ['gaming', 'mouse', 'keyboard', 'rgb', 'headset'], categories: ['Gaming', 'Electronics'] },
  { key: 'study', label: 'Study Setup', keywords: ['study', 'school', 'notebook', 'desk', 'lamp'], categories: ['Stationery', 'Home Essentials'] },
  { key: 'fitness', label: 'Fitness Starter', keywords: ['fitness', 'workout', 'exercise', 'band', 'rope'], categories: ['Fitness'] },
  { key: 'travel', label: 'Travel Kit', keywords: ['travel', 'trip', 'luggage', 'bottle', 'organizer'], categories: ['Travel', 'Lifestyle'] },
  { key: 'home', label: 'Home Essentials', keywords: ['home', 'cleaning', 'storage', 'organizer', 'laundry'], categories: ['Home Essentials'] },
];

function resolveBundleTypeFromGoal(goalValue) {
  const preferredType = String(goalValue || '').toLowerCase();
  if (preferredType.includes('gaming')) return 'gaming';
  if (preferredType.includes('travel')) return 'travel';
  if (preferredType.includes('fitness')) return 'fitness';
  if (preferredType.includes('creator')) return 'creator';
  if (preferredType.includes('smart')) return 'smart_home';
  if (preferredType.includes('kitchen')) return 'kitchen';
  return 'study';
}

function normalizeSearchText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a, b) {
  const s = String(a || '');
  const t = String(b || '');
  if (!s) return t.length;
  if (!t) return s.length;
  const dp = Array.from({ length: s.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= t.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= s.length; i += 1) {
    for (let j = 1; j <= t.length; j += 1) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[s.length][t.length];
}

function normVec(vec) {
  const sumSq = vec.reduce((sum, v) => sum + (Number(v) * Number(v)), 0);
  const mag = Math.sqrt(sumSq) || 1;
  return vec.map((v) => Number(v) / mag);
}

function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || !vecA.length || vecA.length !== vecB.length) return 0;
  let dot = 0;
  for (let i = 0; i < vecA.length; i += 1) dot += Number(vecA[i] || 0) * Number(vecB[i] || 0);
  return dot;
}

function parseEmbeddingVector(raw) {
  if (!raw) return null;
  if (Array.isArray(raw)) {
    const vec = raw.map((n) => Number(n)).filter((n) => Number.isFinite(n));
    return vec.length ? normVec(vec) : null;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const vec = parsed.map((n) => Number(n)).filter((n) => Number.isFinite(n));
    return vec.length ? normVec(vec) : null;
  } catch {
    return null;
  }
}

function meanVector(vectors = []) {
  if (!vectors.length) return null;
  const dim = vectors[0]?.length || 0;
  if (!dim) return null;
  const out = new Array(dim).fill(0);
  let used = 0;
  for (const vec of vectors) {
    if (!Array.isArray(vec) || vec.length !== dim) continue;
    for (let i = 0; i < dim; i += 1) out[i] += Number(vec[i] || 0);
    used += 1;
  }
  if (!used) return null;
  for (let i = 0; i < dim; i += 1) out[i] /= used;
  return normVec(out);
}

function detectIntentFromQuery(query, matchedProducts = []) {
  const q = normalizeSearchText(query);
  if (!q) return null;
  const queryVec = meanVector(
    matchedProducts
      .map((p) => parseEmbeddingVector(p?.embedding))
      .filter(Boolean)
  );
  const ranked = INTENT_CATALOG.map((intent) => {
    const lex = searchScoreForProduct(q, { name: intent.label, category: intent.categories.join(' '), tags: intent.keywords.join(',') });
    const intentHits = matchedProducts.filter((p) => isIntentAlignedProduct(p, intent.key)).length;
    const sem = matchedProducts.length ? intentHits / matchedProducts.length : 0;
    const behaviorHits = matchedProducts.filter((p) => {
      const cat = normalizeSearchText(p?.category);
      return intent.categories.some((c) => cat.includes(normalizeSearchText(c)));
    }).length;
    const behavior = matchedProducts.length ? behaviorHits / matchedProducts.length : 0;
    let hybrid = (sem * 0.55) + (Math.max(0, lex) / 20 * 0.25) + (behavior * 0.2);
    if (lex <= 0) hybrid *= 0.55; // lexical safety floor
    return { ...intent, score: Number(hybrid.toFixed(4)) };
  }).sort((a, b) => b.score - a.score);
  const top = ranked[0];
  if (!top || top.score < 0.12) return null;
  return {
    key: top.key,
    label: top.label,
    confidence: Number(Math.min(0.99, Math.max(0.3, top.score)).toFixed(2)),
    options: ranked.slice(0, 4).map((x) => ({ key: x.key, label: x.label, confidence: x.score })),
  };
}

function isComplementaryAccessory(product) {
  const text = normalizeSearchText(`${product?.name || ''} ${product?.category || ''}`);
  const markers = ['cable', 'adapter', 'charger', 'organizer', 'case', 'storage', 'bottle', 'container', 'pad'];
  return markers.some((m) => text.includes(m));
}

function isIntentAlignedProduct(product, intentKey) {
  const intent = INTENT_CATALOG.find((x) => x.key === intentKey);
  if (!intent) return true;
  const text = normalizeSearchText(`${product?.name || ''} ${product?.category || ''} ${product?.tags || ''}`);
  const cat = normalizeSearchText(product?.category);
  const catHit = intent.categories.some((c) => cat.includes(normalizeSearchText(c)));
  const kwHit = intent.keywords.some((k) => text.includes(normalizeSearchText(k)));
  return catHit || kwHit;
}

function fuzzyTokenMatch(queryToken, candidateToken) {
  if (!queryToken || !candidateToken) return false;
  if (candidateToken.includes(queryToken) || queryToken.includes(candidateToken)) return true;
  if (queryToken[0] !== candidateToken[0]) return false;
  if (Math.abs(queryToken.length - candidateToken.length) > 2) return false;
  const dist = levenshtein(queryToken, candidateToken);
  const maxLen = Math.max(queryToken.length, candidateToken.length);
  if (maxLen <= 4) return dist <= 1;
  if (maxLen <= 7) return dist <= 1;
  if (maxLen <= 10) return dist <= 2;
  return dist <= 2;
}

function searchScoreForProduct(term, product) {
  const query = normalizeSearchText(term);
  if (!query) return 0;
  const queryTokens = query.split(' ').filter(Boolean);

  const name = normalizeSearchText(product?.name);
  const category = normalizeSearchText(product?.category);
  const tags = normalizeSearchText(product?.tags);
  const haystack = `${name} ${category} ${tags}`.trim();
  const candidateTokens = haystack.split(' ').filter(Boolean);

  if (!candidateTokens.length) return 0;

  let score = 0;
  if (name.includes(query)) score += 8;
  if (category.includes(query)) score += 5;
  if (tags.includes(query)) score += 3;

  for (const q of queryTokens) {
    let matched = false;
    for (const token of candidateTokens) {
      if (!token) continue;
      if (token === q) {
        score += 6;
        matched = true;
        break;
      }
      if (fuzzyTokenMatch(q, token)) {
        score += 3;
        matched = true;
        break;
      }
    }
    if (!matched) score -= 2;
  }
  return score;
}

function strictSearchScoreForProduct(term, product) {
  const query = normalizeSearchText(term);
  if (!query) return 0;
  const queryTokens = query.split(' ').filter(Boolean);
  const name = normalizeSearchText(product?.name);
  const category = normalizeSearchText(product?.category);
  const tags = normalizeSearchText(product?.tags);

  let score = 0;
  if (name.includes(query)) score += 12;
  if (category.includes(query)) score += 9;
  if (tags.includes(query)) score += 7;

  for (const token of queryTokens) {
    if (name.includes(token)) score += 6;
    if (category.includes(token)) score += 5;
    if (tags.includes(token)) score += 4;
  }
  return score;
}

function detectProductTypeKey(product) {
  const text = normalizeSearchText(`${product?.name || ''} ${product?.category || ''}`);
  const keywordGroups = [
    ['mouse', ['mouse', 'mice']],
    ['keyboard', ['keyboard', 'keypad']],
    ['headset', ['headset', 'headphone', 'earphone', 'earbuds']],
    ['speaker', ['speaker', 'soundbar']],
    ['microphone', ['microphone', 'mic']],
    ['monitor', ['monitor', 'display', 'screen']],
    ['webcam', ['webcam', 'camera']],
    ['laptop', ['laptop', 'notebook']],
    ['tablet', ['tablet', 'ipad']],
    ['phone', ['phone', 'smartphone', 'mobile']],
    ['charger', ['charger', 'adapter', 'power brick']],
    ['cable', ['cable', 'cord', 'wire']],
    ['power_strip', ['power strip', 'extension', 'surge']],
    ['mouse_pad', ['mouse pad', 'desk mat', 'mat']],
    ['storage', ['ssd', 'hdd', 'flash drive', 'storage', 'memory card']],
    ['router', ['router', 'modem', 'wifi']],
    ['lamp', ['lamp', 'light', 'lighting']],
  ];
  for (const [key, variants] of keywordGroups) {
    if (variants.some((v) => text.includes(v))) return key;
  }
  return '';
}

function parseTags(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => normalizeSearchText(v)).filter(Boolean);
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map((v) => normalizeSearchText(v)).filter(Boolean);
  } catch {
    // ignore parse errors
  }
  return normalizeSearchText(value).split(' ').filter(Boolean);
}

function normalizePreferenceTokens({
  goal = '',
  shoppingPriority = '',
  personaLabel = '',
}) {
  const tokens = [
    goal,
    shoppingPriority,
    personaLabel,
  ]
    .map((item) => String(item || '').trim())
    .filter(Boolean);
  return [...new Set(tokens)];
}

function computeScenarioInsights({
  scenario,
  goal,
  shoppingPriority,
}) {
  const bundle = Array.isArray(scenario?.bundle) ? scenario.bundle : [];
  const budget = Math.max(1, Number(scenario?.budget || 1));
  const totalCost = Math.max(0, Number(scenario?.total || 0));
  const remaining = Math.max(0, Number(scenario?.remaining || 0));
  const spendRatio = Math.max(0, Math.min(1, totalCost / budget));
  const avgRating = bundle.length
    ? bundle.reduce((sum, item) => sum + Number(item?.rating || 0), 0) / bundle.length
    : 0;
  const categories = new Set(bundle.map((item) => String(item?.category || '').trim().toLowerCase()).filter(Boolean));
  const diversity = bundle.length ? Math.min(1, categories.size / Math.min(5, bundle.length)) : 0;
  const avgPopularity = bundle.length
    ? bundle.reduce((sum, item) => sum + Number(item?.popularity_score || 0), 0) / bundle.length
    : 0;

  const intentMatch = Math.round((bundle.length ? 72 : 40) + Math.min(22, categories.size * 6));
  const budgetFit = Math.round(55 + (spendRatio * 40) - Math.min(20, (remaining / budget) * 25));
  const quality = Math.round(Math.max(35, Math.min(98, (avgRating / 5) * 100)));
  const value = Math.round(Math.max(35, Math.min(98, 45 + (avgPopularity * 0.7) + (spendRatio * 18))));
  const diversityScore = Math.round(Math.max(25, Math.min(95, diversity * 100)));

  const score = Math.round(
    (intentMatch * 0.35) +
    (budgetFit * 0.25) +
    (quality * 0.2) +
    (value * 0.1) +
    (diversityScore * 0.1)
  );

  const explanation = [
    `Matched your "${goal || 'shopping'}" goal with ${bundle.length} relevant item${bundle.length === 1 ? '' : 's'}.`,
    `Stayed within your budget window (${Math.max(0, budget - totalCost).toLocaleString()} left).`,
    `Prioritized ${shoppingPriority || 'balanced value'} using rating, value, and budget-fit signals.`,
    categories.size > 1 ? `Included ${categories.size} product categories to avoid duplicates.` : 'Kept selections focused on essential categories.',
  ];

  return {
    metrics: {
      intent_match: intentMatch,
      budget_fit: Math.max(0, Math.min(100, budgetFit)),
      product_quality: quality,
      value_efficiency: value,
      bundle_diversity: diversityScore,
      final_score: Math.max(0, Math.min(100, score)),
    },
    explanation,
  };
}

export default function HomePage() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const { addBundleToCart } = useCommerce();

  const [mode, setMode] = useState('normal');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [activityRecommendations, setActivityRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState('');
  const [recommendationMeta, setRecommendationMeta] = useState(null);
  const [popularBundles, setPopularBundles] = useState([]);
  const [smartModeMeta, setSmartModeMeta] = useState(null);
  const [detectedIntent, setDetectedIntent] = useState(null);
  const [intentOverrideKey, setIntentOverrideKey] = useState('');
  const debugReco = useMemo(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('debugReco') === '1';
    } catch {
      return false;
    }
  }, []);

  const [goal, setGoal] = useState('');
  const [budget, setBudget] = useState(5000);
  const [bundleScenarios, setBundleScenarios] = useState([]);
  const [generatedBundleIdsByScenario, setGeneratedBundleIdsByScenario] = useState({});
  const resolvedMode = mode === 'smart' ? 'smart' : 'normal';
  const userKey = user?.id || 'anon';
  const SMART_CACHE_VERSION = 1;
  const smartCacheStorageKey = `optimall_smart_flow_v${SMART_CACHE_VERSION}:${userKey}`;
  const modeStorageKey = `optimall_home_mode:${userKey}`;

  useEffect(() => {
    let mounted = true;
    async function loadProducts() {
      try {
        const rows = await getProducts();
        if (mounted) setProducts(rows);
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load products');
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    }
    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(modeStorageKey);
      if (raw === 'smart' || raw === 'normal') {
        setMode(raw);
      }
    } catch {
      // ignore storage issues
    }
  }, [modeStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(modeStorageKey, resolvedMode);
    } catch {
      // ignore storage issues
    }
  }, [modeStorageKey, resolvedMode]);

  useEffect(() => {
    setBundleScenarios([]);
    setError('');
  }, [userKey]);

  useEffect(() => {
    if (!isSignedIn) return;
    try {
      const raw = localStorage.getItem(smartCacheStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed?.goal === 'string' && parsed.goal.trim()) setGoal(parsed.goal);
      if (Number.isFinite(Number(parsed?.budget)) && Number(parsed.budget) > 0) setBudget(Number(parsed.budget));
      if (Array.isArray(parsed?.bundleScenarios)) setBundleScenarios(parsed.bundleScenarios);
    } catch {
      // ignore invalid local cache
    }
  }, [isSignedIn, smartCacheStorageKey]);

  const filteredProducts = useMemo(() => {
    const byCategory = categoryFilter === 'all'
      ? products
      : products.filter((product) => String(product?.category || '').toLowerCase() === categoryFilter.toLowerCase());

    if (sortBy === 'price_asc') return [...byCategory].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sortBy === 'price_desc') return [...byCategory].sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    if (sortBy === 'newest') return [...byCategory].sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
    return byCategory;
  }, [products, categoryFilter, sortBy]);

  const categories = useMemo(
    () => ['all', ...new Set(products.map((p) => String(p.category || '').trim()).filter(Boolean))],
    [products]
  );

  const recommendedProducts = useMemo(
    () => (activityRecommendations.length ? activityRecommendations : filteredProducts.slice(0, 8)),
    [activityRecommendations, filteredProducts]
  );

  useEffect(() => {
    let active = true;
    async function loadActivityRecommendations() {
      if (!isSignedIn || !products.length) {
        setActivityRecommendations([]);
        setRecommendationMeta(null);
        return;
      }
      try {
        setLoadingRecommendations(true);
        setRecommendationError('');
        const token = await getToken();
        if (!token) throw new Error('Missing Clerk token.');
        const result = await postIntelligencePipeline(
          {
            budget: 8000,
            preferences: ['General'],
            products: [],
            activity_events: [],
          },
          token
        );

        const hasActivityContext = Boolean(result?.meta?.has_activity_context);
        if (active) setRecommendationMeta(result?.meta || null);
        const suggestions = result?.realtime_recommendation?.suggestions || [];
        const productById = new Map(products.map((item) => [Number(item.id), item]));
        const activityBased = hasActivityContext
          ? suggestions
            .map((entry) => {
              const rec = entry?.product || {};
              const fallback = productById.get(Number(rec.id)) || {};
              const score = Number(entry?.realtime_score ?? entry?.model_score ?? 0);
              const reasons = [];
              if (Number(rec?.embedding_similarity || fallback?.embedding_similarity || 0) > 0.55) reasons.push('semantic match');
              if (Number(rec?.outcome_boost || fallback?.outcome_boost || 0) > 0.35) reasons.push('activity match');
              if (Number(rec?.popularity_score || fallback?.popularity_score || 0) >= 40) reasons.push('popular now');
              if (Number(rec?.price || fallback?.price || 0) > 0 && Number(rec?.price || fallback?.price || 0) <= 1500) reasons.push('price-friendly');
              return {
                ...fallback,
                ...rec,
                image_path: rec?.image_path || fallback?.image_path || null,
                _debug_score: score,
                _debug_model_score: Number(entry?.model_score ?? 0),
                _debug_blended_score: Number(entry?.blended_score ?? 0),
                _reason_chips: reasons.slice(0, 2),
              };
            })
            .filter((item) => Number(item?.id || 0) > 0)
            .slice(0, 8)
          : [];
        if (active) setActivityRecommendations(activityBased);
      } catch (err) {
        if (active) setRecommendationError(err.message || 'Could not load activity recommendations.');
      } finally {
        if (active) setLoadingRecommendations(false);
      }
    }
    loadActivityRecommendations();
    return () => {
      active = false;
    };
  }, [isSignedIn, products, getToken]);

  useEffect(() => {
    let active = true;
    async function loadPopularBundles() {
      try {
        const rows = await getPopularBundles(6);
        if (active) setPopularBundles(Array.isArray(rows) ? rows : []);
      } catch {
        if (active) setPopularBundles([]);
      }
    }
    loadPopularBundles();
    return () => {
      active = false;
    };
  }, []);

  const submitSearch = useCallback((rawTerm) => {
    const term = String(rawTerm || '').trim();
    if (!term) {
      setSearchTerm('');
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    setSearchTerm(term);
    window.setTimeout(async () => {
      const matches = products
        .map((product) => ({
          product,
          score: searchScoreForProduct(term, product),
        }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.product);
      setSearchResults(matches);
      setSearchLoading(false);

      if (isSignedIn) {
        try {
          const token = await getToken();
          if (token) {
            await postActivity({
              event_type: 'search',
              search_query: term,
              weight_score: 1,
            }, token);
          }
        } catch {
          // non-blocking analytics write
        }
      }
    }, 450);
  }, [products, isSignedIn, getToken]);

  const runSmartMode = useCallback(async (context = {}) => {
    setRunning(true);
    setError('');
    try {
      if (!isSignedIn) throw new Error('Sign in first to run Smart mode.');
      const token = await getToken();
      if (!token) throw new Error('Missing Clerk token.');

      const goalValue = String(context.goal || goal || '').trim();
      const shoppingPriority = String(context.shoppingPriority || '').trim();
      const base = Math.max(500, Number(context.budget || budget) || 500);
      let scopedProducts = filteredProducts;
      if (goalValue) {
        const strictMatches = filteredProducts
          .map((product) => ({ product, score: strictSearchScoreForProduct(goalValue, product) }))
          .filter((entry) => entry.score > 0)
          .sort((a, b) => b.score - a.score)
          .map((entry) => entry.product);

        // Fallback to fuzzy matching only when strict intent matching finds nothing.
        scopedProducts = strictMatches.length
          ? strictMatches
          : filteredProducts
            .map((product) => ({ product, score: searchScoreForProduct(goalValue, product) }))
            .filter((entry) => entry.score > 0)
            .sort((a, b) => b.score - a.score)
            .map((entry) => entry.product);
      }
      if (!scopedProducts.length) {
        throw new Error('No products matched your Step 1 query. Try another keyword.');
      }
      const scopedHead = scopedProducts.slice(0, 12);
      const categorySet = new Set(scopedHead.map((p) => normalizeSearchText(p?.category)).filter(Boolean));
      const tagSet = new Set(scopedHead.flatMap((p) => parseTags(p?.tags)));
      const usedIds = new Set(scopedHead.map((p) => Number(p.id)));
      const queryVector = meanVector(
        scopedHead
          .map((p) => parseEmbeddingVector(p?.embedding))
          .filter(Boolean)
      );
      const complementCandidates = filteredProducts
        .filter((p) => !usedIds.has(Number(p.id)))
        .map((p) => {
          const category = normalizeSearchText(p?.category);
          const tags = parseTags(p?.tags);
          const overlap = tags.filter((t) => tagSet.has(t)).length;
          const sameCategory = categorySet.has(category) ? 1 : 0;
          const ratingBoost = Number(p?.rating || 0) * 0.25;
          const score = sameCategory * 3 + overlap * 1.5 + ratingBoost;
          return { product: p, score };
        })
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 18)
        .map((entry) => entry.product);
      const scopedPool = [...scopedHead, ...complementCandidates];
      const detected = detectIntentFromQuery(goalValue, scopedHead);
      setDetectedIntent(detected);
      const activeIntentKey = intentOverrideKey || detected?.key || '';
      const hybridRankedPool = scopedPool
        .map((p) => {
          const lexical = Math.max(0, strictSearchScoreForProduct(goalValue, p));
          const lexicalNorm = Math.min(1, lexical / 20);
          const emb = parseEmbeddingVector(p?.embedding);
          const semantic = queryVector && emb && queryVector.length === emb.length
            ? Math.max(0, (cosineSimilarity(queryVector, emb) + 1) / 2)
            : 0;
          const behavior = Number(p?.outcome_boost || 0) > 0
            ? Math.min(1, Number(p?.outcome_boost || 0))
            : Math.min(1, Number(p?.popularity_score || 0) / 100);
          let hybrid = (semantic * 0.55) + (lexicalNorm * 0.25) + (behavior * 0.2);
          if (lexical <= 0) hybrid *= 0.45; // lexical safety floor against semantic drift
          const intentAligned = activeIntentKey
            ? (isIntentAlignedProduct(p, activeIntentKey) || isComplementaryAccessory(p))
            : true;
          if (activeIntentKey && !intentAligned) hybrid *= 0.4;
          return { product: p, hybrid, lexical };
        })
        .filter((entry) => entry.hybrid > 0)
        .sort((a, b) => b.hybrid - a.hybrid)
        .map((entry) => entry.product);
      const finalScopedPool = hybridRankedPool.length ? hybridRankedPool : scopedPool;
      const scenarioDefs = [
        {
          key: 'budget_saver',
          label: 'Budget Saver',
          budget: Math.max(500, Math.round((base * 0.72) / 100) * 100),
          personaLabel: 'Cheapest option',
        },
        {
          key: 'best_value',
          label: 'Best Value',
          budget: Math.max(500, Math.round(base / 100) * 100),
          personaLabel: 'Balanced recommendation',
        },
        {
          key: 'premium',
          label: 'Premium',
          budget: Math.max(500, Math.round((base * 1.2) / 100) * 100),
          personaLabel: 'Highest quality',
        },
      ];
      const deduped = scenarioDefs.filter((item, idx, arr) => arr.findIndex((x) => x.budget === item.budget) === idx);
      let latestSmartMeta = null;

      const results = await Promise.all(
        deduped.map(async (scenario) => {
          const preferences = normalizePreferenceTokens({
            goal: goalValue,
            shoppingPriority: shoppingPriority || scenario.personaLabel,
            personaLabel: scenario.personaLabel,
          });
          const payload = {
            budget: Number(scenario.budget),
            preferences,
            products: finalScopedPool,
          };
          const data = await postIntelligencePipeline(payload, token);
          if (!latestSmartMeta && data?.meta) latestSmartMeta = data.meta;
          const optimized = data?.bundle_optimization || {};
          const productById = new Map(finalScopedPool.map((item) => [Number(item.id), item]));
          const seenProductIds = new Set();
          const seenTypeKeys = new Set();
          const normalizedBundle = (optimized.bundle || [])
            .map((item) => ({
              ...(productById.get(Number(item?.id || 0)) || {}),
              ...item,
              image_path: item?.image_path || productById.get(Number(item?.id || 0))?.image_path || null,
              qty: Number(item.qty || 1),
            }))
            .filter((item) => {
              const pid = Number(item?.id || 0);
              if (!pid) return false;
              if (seenProductIds.has(pid)) return false;
              const typeKey = detectProductTypeKey(item);
              if (typeKey && seenTypeKeys.has(typeKey)) return false;
              seenProductIds.add(pid);
              if (typeKey) seenTypeKeys.add(typeKey);
              return true;
            });
          const baseScenario = {
            key: scenario.key,
            label: scenario.label,
            budget: Number(scenario.budget),
            total: Number(optimized.total_cost || 0),
            remaining: Number(optimized.remaining_budget || 0),
            score: Number(optimized.bundle_score || 0),
            persona: scenario.personaLabel,
            bundle: normalizedBundle,
          };
          const insights = computeScenarioInsights({
            scenario: baseScenario,
            goal: goalValue,
            shoppingPriority: shoppingPriority || scenario.personaLabel,
          });
          return {
            ...baseScenario,
            metrics: insights.metrics,
            explanation: insights.explanation,
          };
        })
      );
      const normalizedTiers = [...results].sort((a, b) => Number(a.total || 0) - Number(b.total || 0));
      setBundleScenarios(normalizedTiers);
      setSmartModeMeta(latestSmartMeta);

      const bundleType = resolveBundleTypeFromGoal(goalValue);
      const savedRows = await Promise.all(
        normalizedTiers
          .filter((scenario) => Array.isArray(scenario?.bundle) && scenario.bundle.length > 0)
          .map(async (scenario) => {
            const saved = await postSaveBundle(
              {
                name: `${goalValue || 'Smart'} - ${scenario.label} Bundle`,
                description: `Auto-saved from Smart mode generation (${scenario.key}).`,
                bundle_type: bundleType,
                estimated_total_price: Number(scenario.total || 0),
                items: (scenario.bundle || []).map((item) => ({
                  product_id: Number(item?.id || 0),
                  quantity: Math.max(1, Number(item?.qty || 1)),
                })),
              },
              token
            ).catch(() => null);
            return { key: scenario.key, bundleId: Number(saved?.id || 0) || null };
          })
      );
      const nextIds = {};
      for (const row of savedRows) {
        if (row?.key && Number(row?.bundleId || 0) > 0) nextIds[row.key] = Number(row.bundleId);
      }
      setGeneratedBundleIdsByScenario(nextIds);

      await postActivity({ event_type: 'search', search_query: `${goalValue} @ ${base}`, weight_score: 1 }, token);
    } catch (err) {
      setError(err.message || 'Failed to generate smart bundle');
      setBundleScenarios([]);
    } finally {
      setRunning(false);
    }
  }, [isSignedIn, getToken, goal, budget, filteredProducts, intentOverrideKey]);

  const resetSmartFlow = useCallback(() => {
    setBundleScenarios([]);
    setGeneratedBundleIdsByScenario({});
    setError('');
  }, []);

  const restoreSmartScenarios = useCallback((nextScenarios) => {
    if (!Array.isArray(nextScenarios)) return;
    setBundleScenarios(nextScenarios);
  }, []);

  return (
    <div className="min-h-screen pb-16">
      <Header mode={resolvedMode} onModeChange={setMode} />

      <main className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6">
        {resolvedMode === 'normal' && (
          <NormalMode
            isSignedIn={isSignedIn}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSubmitSearch={submitSearch}
            activeSearchTerm={searchTerm}
            searchResults={searchResults}
            searchLoading={searchLoading}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            categories={categories}
            sortBy={sortBy}
            setSortBy={setSortBy}
            hasActivityRecommendations={activityRecommendations.length > 0}
            loadingRecommendations={loadingRecommendations}
            recommendationError={recommendationError}
            recommendationMeta={recommendationMeta}
            debugReco={debugReco}
            recommendedProducts={recommendedProducts}
            popularBundles={popularBundles}
            addBundleToCart={addBundleToCart}
            filteredProducts={filteredProducts}
            loadingProducts={loadingProducts}
          />
        )}

        {resolvedMode === 'smart' && (
          <SmartMode
            userKey={userKey}
            smartCacheStorageKey={smartCacheStorageKey}
            goal={goal}
            setGoal={setGoal}
            budget={budget}
            setBudget={setBudget}
            runSmartMode={runSmartMode}
            resetSmartFlow={resetSmartFlow}
            restoreSmartScenarios={restoreSmartScenarios}
            running={running}
            loadingProducts={loadingProducts}
            error={error}
            bundleScenarios={bundleScenarios}
            generatedBundleIdsByScenario={generatedBundleIdsByScenario}
            modelMeta={smartModeMeta}
            debugReco={debugReco}
            addBundleToCart={addBundleToCart}
          />
        )}

        {mode !== 'normal' && mode !== 'smart' && (
          <div className="rounded-xl border border-[#d5dded] bg-white p-4 text-sm text-slate-700">
            Home view reset: unsupported mode detected. Showing normal browse mode.
          </div>
        )}

        {!isSignedIn && (
          <p className="mt-4 text-sm text-slate-600">Sign in to use Smart mode recommendations and bundle generation.</p>
        )}
      </main>
    </div>
  );
}
