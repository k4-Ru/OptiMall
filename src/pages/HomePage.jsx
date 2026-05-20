import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import Header from '../components/Header';
import { getProducts, postActivity, postIntelligencePipeline } from '../lib/api';
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
  const { addToCart } = useCommerce();

  const [mode, setMode] = useState('normal');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [activityRecommendations, setActivityRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState('');

  const [goal, setGoal] = useState('Study Setup');
  const [budget, setBudget] = useState(5000);
  const [bundleScenarios, setBundleScenarios] = useState([]);
  const resolvedMode = mode === 'smart' ? 'smart' : 'normal';

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

  const dynamicGoals = useMemo(() => {
    const categoryGoals = [...new Set(products.map((p) => String(p.category || '').trim()).filter(Boolean))]
      .slice(0, 12)
      .map((c) => `${c} Focus`);
    return [...new Set([...CORE_GOALS, ...categoryGoals])];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const key = searchQuery.trim().toLowerCase();
    const searched = !key
      ? products
      : products.filter((product) => {
        const name = String(product?.name || '').toLowerCase();
        const category = String(product?.category || '').toLowerCase();
        return name.includes(key) || category.includes(key);
      });

    const byCategory = categoryFilter === 'all'
      ? searched
      : searched.filter((product) => String(product?.category || '').toLowerCase() === categoryFilter.toLowerCase());

    if (sortBy === 'price_asc') return [...byCategory].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sortBy === 'price_desc') return [...byCategory].sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    if (sortBy === 'newest') return [...byCategory].sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
    return byCategory;
  }, [products, searchQuery, categoryFilter, sortBy]);

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

        const suggestions = result?.realtime_recommendation?.suggestions || [];
        const activityBased = suggestions.map((entry) => entry?.product).filter(Boolean).slice(0, 8);
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

      const results = await Promise.all(
        deduped.map(async (scenario) => {
          const payload = {
            budget: Number(scenario.budget),
            preferences: [goal],
            products: filteredProducts,
          };
          const data = await postIntelligencePipeline(payload, token);
          const optimized = data?.bundle_optimization || {};
          const normalizedBundle = (optimized.bundle || []).map((item) => ({
            ...item,
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
      setBundleScenarios(results);

      await postActivity({ event_type: 'search', search_query: `${goal} @ ${budget}`, weight_score: 1 }, token);
    } catch (err) {
      setError(err.message || 'Failed to generate smart bundle');
      setBundleScenarios([]);
    } finally {
      setRunning(false);
    }
  }, [isSignedIn, getToken, goal, budget, filteredProducts]);

  return (
    <div className="min-h-screen bg-[#eef2f6] pb-16">
      <Header mode={resolvedMode} onModeChange={setMode} />

      <main className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6">
        {resolvedMode === 'normal' && (
          <NormalMode
            isSignedIn={isSignedIn}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            categories={categories}
            sortBy={sortBy}
            setSortBy={setSortBy}
            loadingRecommendations={loadingRecommendations}
            recommendationError={recommendationError}
            recommendedProducts={recommendedProducts}
            addToCart={addToCart}
            filteredProducts={filteredProducts}
            loadingProducts={loadingProducts}
          />
        )}

        {resolvedMode === 'smart' && (
          <SmartMode
            dynamicGoals={dynamicGoals}
            goal={goal}
            setGoal={setGoal}
            budget={budget}
            setBudget={setBudget}
            runSmartMode={runSmartMode}
            running={running}
            loadingProducts={loadingProducts}
            error={error}
            bundleScenarios={bundleScenarios}
            addToCart={addToCart}
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
