import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import Header from '../components/Header';
import { getPopularBundles, getProducts, postActivity, postIntelligencePipeline } from '../lib/api';
import { useCommerce } from '../lib/commerceContext';
import NormalMode from './home/NormalMode';
import SmartMode from './home/SmartMode';

const CORE_GOALS = [
  'Study Setup',
  'Gaming Setup',
  'Content Creator Kit',
  'Budget Essentials',
  'Gift Bundle',
  'Work From Home Setup',
  'Home Office Upgrade',
  'Kitchen Essentials',
  'Fitness Starter Pack',
  'Travel Kit',
  'Dorm Move-in',
  'Family Essentials',
  'Streaming Setup',
  'Mobile Creator Kit',
];

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

  const dynamicGoals = useMemo(() => {
    const categoryGoals = [...new Set(products.map((p) => String(p.category || '').trim()).filter(Boolean))]
      .slice(0, 12)
      .map((c) => `${c} Focus`);
    return [...new Set([...CORE_GOALS, ...categoryGoals])];
  }, [products]);

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
      const key = term.toLowerCase();
      const matches = products.filter((product) => {
        const name = String(product?.name || '').toLowerCase();
        const category = String(product?.category || '').toLowerCase();
        const tags = String(product?.tags || '').toLowerCase();
        return name.includes(key) || category.includes(key) || tags.includes(key);
      });
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

  const runSmartMode = useCallback(async () => {
    setRunning(true);
    setError('');
    try {
      if (!isSignedIn) throw new Error('Sign in first to run Smart mode.');
      const token = await getToken();
      if (!token) throw new Error('Missing Clerk token.');

      const base = Math.max(500, Number(budget) || 500);
      const scenarioDefs = [
        { key: 'saver', label: 'Saver', budget: Math.max(500, Math.round((base * 0.75) / 100) * 100) },
        { key: 'balanced', label: 'Balanced', budget: Math.max(500, Math.round(base / 100) * 100) },
        { key: 'stretch', label: 'Stretch', budget: Math.max(500, Math.round((base * 1.25) / 100) * 100) },
      ];
      const deduped = scenarioDefs.filter((item, idx, arr) => arr.findIndex((x) => x.budget === item.budget) === idx);
      let latestSmartMeta = null;

      const results = await Promise.all(
        deduped.map(async (scenario) => {
          const payload = {
            budget: Number(scenario.budget),
            preferences: [goal],
            products: filteredProducts,
          };
          const data = await postIntelligencePipeline(payload, token);
          if (!latestSmartMeta && data?.meta) latestSmartMeta = data.meta;
          const optimized = data?.bundle_optimization || {};
          const productById = new Map(filteredProducts.map((item) => [Number(item.id), item]));
          const normalizedBundle = (optimized.bundle || []).map((item) => ({
            ...(productById.get(Number(item?.id || 0)) || {}),
            ...item,
            image_path: item?.image_path || productById.get(Number(item?.id || 0))?.image_path || null,
            qty: Number(item.qty || 1),
          }));
          return {
            key: scenario.key,
            label: scenario.label,
            budget: Number(scenario.budget),
            total: Number(optimized.total_cost || 0),
            remaining: Number(optimized.remaining_budget || 0),
            score: Number(optimized.bundle_score || 0),
            bundle: normalizedBundle,
          };
        })
      );
      const tierOrder = [
        { key: 'starter', label: 'Starter' },
        { key: 'balanced', label: 'Balanced' },
        { key: 'max', label: 'Max Value' },
      ];
      const normalizedTiers = [...results]
        .sort((a, b) => Number(a.total || 0) - Number(b.total || 0))
        .map((item, idx) => ({
          ...item,
          key: tierOrder[idx]?.key || item.key,
          label: tierOrder[idx]?.label || item.label,
        }));
      setBundleScenarios(normalizedTiers);
      setSmartModeMeta(latestSmartMeta);

      await postActivity({ event_type: 'search', search_query: `${goal} @ ${budget}`, weight_score: 1 }, token);
    } catch (err) {
      setError(err.message || 'Failed to generate smart bundle');
      setBundleScenarios([]);
    } finally {
      setRunning(false);
    }
  }, [isSignedIn, getToken, goal, budget, filteredProducts]);

  const resetSmartFlow = useCallback(() => {
    setBundleScenarios([]);
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
            dynamicGoals={dynamicGoals}
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
