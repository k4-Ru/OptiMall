import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import Header from '../components/Header';
import { getProducts, postIntelligencePipeline } from '../lib/api';
import { useCommerce } from '../lib/commerceContext';

function formatPrice(value) {
  return `P${Number(value || 0).toLocaleString()}`;
}

function productImage(product) {
  return product?.image_path || null;
}

export default function SmartBundlesPage() {
  const { getToken, isSignedIn } = useAuth();
  const { addToCart } = useCommerce();
  const [searchQuery, setSearchQuery] = useState('');
  const [budget, setBudget] = useState('5000');
  const [preferences, setPreferences] = useState('Tech,Home');
  const [products, setProducts] = useState([]);
  const [bundle, setBundle] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

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

  const filteredProducts = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return products;
    return products.filter((product) => {
      const name = String(product?.name || '').toLowerCase();
      const category = String(product?.category || '').toLowerCase();
      return name.includes(keyword) || category.includes(keyword);
    });
  }, [products, searchQuery]);

  async function runBundlePipeline() {
    setRunning(true);
    setError('');
    try {
      if (!isSignedIn) throw new Error('Sign in first to run smart bundles.');
      const token = await getToken();
      if (!token) throw new Error('Missing Clerk token.');

      const data = await postIntelligencePipeline(
        {
          budget: Number(budget),
          preferences: preferences.split(',').map((p) => p.trim()).filter(Boolean),
          products: filteredProducts,
          activity_events: [],
          latest_event: null,
        },
        token
      );

      const bundleResult = data?.bundle_optimization || {};
      setBundle(bundleResult.bundle || []);
      setMeta({
        totalCost: Number(bundleResult.total_cost || 0),
        remainingBudget: Number(bundleResult.remaining_budget || 0),
        score: Number(bundleResult.bundle_score || 0),
      });
    } catch (err) {
      setError(err.message || 'Failed to run pipeline');
      setBundle([]);
      setMeta(null);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="min-h-screen pb-16 font-sans">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="mx-auto max-w-[1440px] px-8 py-8">
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold text-slate-900">Smart Bundles</h1>
          <p className="mt-1 text-sm text-slate-600">
            Powered by `/api/intelligence/pipeline`. No personalization yet; uses current catalog and preferences.
          </p>
          <div className="mt-4 grid gap-3 md:max-w-2xl md:grid-cols-3">
            <input
              type="number"
              min="1"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="rounded border border-slate-300 px-3 py-2"
              placeholder="Budget"
            />
            <input
              type="text"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              className="rounded border border-slate-300 px-3 py-2 md:col-span-2"
              placeholder="Preferences (comma-separated)"
            />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={runBundlePipeline}
              disabled={running || loadingProducts}
              className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {running ? 'Running...' : 'Generate Bundle'}
            </button>
            {loadingProducts && <span className="text-sm text-slate-500">Loading catalog...</span>}
          </div>
          {!!error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </section>

        {meta && (
          <section className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Total Cost</p>
              <p className="mt-1 text-xl font-extrabold text-slate-900">{formatPrice(meta.totalCost)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Remaining Budget</p>
              <p className="mt-1 text-xl font-extrabold text-emerald-700">{formatPrice(meta.remainingBudget)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Bundle Score</p>
              <p className="mt-1 text-xl font-extrabold text-[#FF6B00]">{meta.score.toFixed(3)}</p>
            </div>
          </section>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Bundle Items</h2>
          {bundle.length === 0 && <p className="mt-3 text-sm text-slate-500">No bundle generated yet.</p>}
          {bundle.length > 0 && (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {bundle.map((item) => {
                const fullProduct = products.find((p) => Number(p.id) === Number(item.id));
                return (
                  <article key={item.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-slate-50">
                      {productImage(fullProduct) ? (
                        <img src={productImage(fullProduct)} alt={item.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs font-semibold text-slate-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">Score: {Number(item.score || 0).toFixed(3)}</p>
                    <p className="mt-2 text-lg font-extrabold text-[#FF6B00]">{formatPrice(item.price)}</p>
                    <button type="button" onClick={() => addToCart(item, 1)} className="mt-3 rounded bg-[#1A2A54] px-3 py-1 text-xs font-bold text-white">
                      Add to Cart
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
